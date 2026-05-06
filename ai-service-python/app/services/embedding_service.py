from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class EmbeddingService:

    def __init__(self):
        self.model = SentenceTransformer(
            "sentence-transformers/all-MiniLM-L6-v2"
        )

    def encode(self, texts):
        return self.model.encode(texts)

    def similarity_matrix(self, query_embedding, embeddings):
        return cosine_similarity(
            [query_embedding],
            embeddings
        )[0]
