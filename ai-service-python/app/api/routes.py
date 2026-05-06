from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import List
from openai import OpenAI
import os

from app.services.skill_detector import SkillDetector
from app.services.experience_detector import ExperienceDetector
from app.services.job_matcher import JobMatcher
from app.services.candidate_ranker import CandidateRanker

router = APIRouter()

detector = SkillDetector()
exp_detector = ExperienceDetector()
matcher = JobMatcher()
ranker = CandidateRanker()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class AnalyzeRequest(BaseModel):
    cv_text: str

class MatchRequest(BaseModel):
    cv_text: str
    job_text: str

class CandidateItem(BaseModel):
    name: str
    cv_text: str


class RankRequest(BaseModel):
    job_text: str
    candidates: List[CandidateItem]

def get_seniority(years):
    if years <= 1:
        return "Junior"
    elif years <= 4:
        return "Mid"
    return "Senior"

@router.post("/analyze")
def analyze_cv(request: AnalyzeRequest):

    skills = detector.detect(request.cv_text)
    years = exp_detector.detect_years(request.cv_text)
    seniority = get_seniority(years)

    score = min(len(skills) * 8 + years * 5, 100)

    return {
        "skills": skills,
        "experience_years": years,
        "score": score,
        "seniority": seniority
    }

@router.post("/match")
def match_job(request: MatchRequest):

    result = matcher.match(
        request.cv_text,
        request.job_text
    )

    return result

@router.post("/rank")
def rank_candidates(request: RankRequest):

    results = ranker.rank(
        request.job_text,
        [c.dict() for c in request.candidates]
    )

    return {
        "ranking": results
    }

@router.post("/candidate-insights")
def candidate_insights(data: dict):

    candidate = data["candidate"]
    job = data["job"]

    prompt = f"""
    You are an expert recruiter.

    Job Description:
    {job}

    Candidate:
    Name: {candidate['name']}
    Score: {candidate['score']}
    Matched Skills: {candidate['matched_skills']}
    Missing Skills: {candidate['missing_skills']}

    Write:
    1. Fit Summary
    2. Main Strengths
    3. Main Risks
    4. Interview Focus Areas

    Keep concise and professional.
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    return {
        "insight": response.choices[0].message.content
    }
