from app.services.skill_detector import SkillDetector
from app.services.embedding_service import EmbeddingService
from app.services.experience_detector import ExperienceDetector


class JobMatcher:

    def __init__(self):
        self.detector = SkillDetector()
        self.embedding = EmbeddingService()
        self.exp = ExperienceDetector()

    def match(self, cv_text: str, job_text: str):

        reasons = []

        cv_skills = self.detector.detect(cv_text)
        job_skills = self.detector.detect(job_text)

        cv_skill_names = set(x["name"] for x in cv_skills)
        job_skill_names = set(x["name"] for x in job_skills)

        matched = list(cv_skill_names.intersection(job_skill_names))
        missing = list(job_skill_names - cv_skill_names)

        # -------- Skills explanation --------
        for skill in matched:
            reasons.append(f"Matched required skill: {skill}")

        for skill in missing:
            reasons.append(f"Missing desired skill: {skill}")

        # skill overlap %
        skill_score = 0

        if len(job_skill_names) > 0:
            skill_score = len(matched) / len(job_skill_names)

        # semantic similarity
        cv_embedding = self.embedding.encode([cv_text])[0]
        job_embedding = self.embedding.encode([job_text])[0]

        semantic_score = self.embedding.similarity_matrix(
            cv_embedding,
            [job_embedding]
        )[0]

        if semantic_score > 0.70:
            reasons.append("Strong semantic alignment with role description")
        elif semantic_score > 0.50:
            reasons.append("Moderate semantic alignment with role")
        else:
            reasons.append("Low semantic alignment with role")

        # -------- Experience --------
        years = self.exp.detect_years(cv_text)

        if years >= 5:
            reasons.append("Senior level experience detected")
        elif years >= 2:
            reasons.append("Mid-level experience detected")
        else:
            reasons.append("Junior level experience detected")

        # final score
        final_score = int(
            (skill_score * 0.65 + semantic_score * 0.35) * 100
        )

        return {
            "match_score": final_score,
            "matched_skills": matched,
            "missing_skills": missing,
            "semantic_similarity": round(float(semantic_score), 2),
            "experience_years": years,
            "reasons": reasons
        }