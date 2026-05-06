from app.services.job_matcher import JobMatcher


class CandidateRanker:

    def __init__(self):
        self.matcher = JobMatcher()

    def rank(self, job_text, candidates):

        results = []

        for candidate in candidates:

            match = self.matcher.match(
                candidate["cv_text"],
                job_text
            )

            results.append({
                "name": candidate["name"],
                "score": match["match_score"],
                "matched_skills": match["matched_skills"],
                "missing_skills": match["missing_skills"]
            })

        results.sort(
            key=lambda x: x["score"],
            reverse=True
        )

        return results