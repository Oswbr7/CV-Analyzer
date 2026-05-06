import json
import re
from pathlib import Path

from app.services.embedding_service import EmbeddingService

class SkillDetector:
    def __init__(self):
        path = Path("app/data/skills_database.json")

        with open(path, "r", encoding="utf-8") as f:
            self.skills = json.load(f)

        self.embedding_service = EmbeddingService()

        # Precompute embeddings
        descriptions = [
            skill["description"]
            for skill in self.skills
        ]

        self.skill_embeddings = self.embedding_service.encode(
            descriptions
        )

    def detect(self, text: str):
        if not text:
            return []

        normalized_text = text.lower()
        found_skills = []
        used_ranges = []

        # -------- FASE 1: exact match --------
        for skill in self.skills:

            name = skill["name"]

            if re.search(rf"\b{re.escape(name.lower())}\b", normalized_text):
                found_skills.append({
                    "name": name,
                    "confidence": 0.98,
                    "source": "keyword"
                })

         # -------- FASE 2: semantic match --------
        # sentences = self.split_sentences(text)
        sentences = re.split(r'[.\n,;]', text)

        for sentence in sentences:

            sentence = sentence.strip()

            if len(sentence) < 10:
                continue

            query_embedding = self.embedding_service.encode(
                [sentence]
            )[0]

            scores = self.embedding_service.similarity_matrix(
                query_embedding,
                self.skill_embeddings
            )

            ranked = list(zip(self.skills, scores))

            ranked.sort(
                key=lambda x: x[1],
                reverse=True
            )

            top_matches = ranked[:3]

            for skill, score in top_matches:

                if score < 0.35:
                    continue

                name = skill["name"]

                if any(x["name"] == name for x in found_skills):
                    continue

                found_skills.append({
                    "name": name,
                    "confidence": round(float(score), 2),
                    "source": "embedding"
                })

        return found_skills
    
    def split_sentences(self, text: str):

        parts = re.split(r'[.\n,;]', text)

        return [
            p.strip()
            for p in parts
            if len(p.strip()) > 10
        ]
