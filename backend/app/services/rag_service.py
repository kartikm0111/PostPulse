import logging
import math
import uuid
from typing import List, Dict, Any, Optional

logger = logging.getLogger("postpulse.rag_service")

class RAGBrandVoiceService:
    """
    RAG (Retrieval-Augmented Generation) Brand Voice & Vector Knowledge Base.
    Stores user brand guidelines, past high-performing posts, and terminology rules.
    Injects context into LLM prompts so copy mirrors the exact brand voice.
    """
    def __init__(self):
        # In-memory vector index storing embeddings & document metadata
        self.brand_docs: Dict[str, List[Dict[str, Any]]] = {}

    def _simple_text_embedding(self, text: str) -> List[float]:
        """
        Generates lightweight term-frequency vector embedding for similarity matching
        """
        words = [w.lower().strip(".,!?:;\"'") for w in text.split() if len(w) > 2]
        vocab = ["hackathon", "ai", "launch", "exclusive", "community", "tech", "event", "growth", "build", "discount", "code", "future", "premium", "boost"]
        vec = [0.0] * len(vocab)
        for i, word in enumerate(vocab):
            if word in words:
                vec[i] = float(words.count(word))
        # Normalize
        norm = Math_sqrt = math.sqrt(sum(v * v for v in vec)) or 1.0
        return [v / norm for v in vec]

    def add_brand_knowledge(self, user_id: str, title: str, content: str, category: str = "guidelines") -> Dict[str, Any]:
        """
        Adds brand guidelines or viral post exemplars to vector store
        """
        if user_id not in self.brand_docs:
            self.brand_docs[user_id] = []

        doc_id = f"rag_{uuid.uuid4().hex[:10]}"
        vector = self._simple_text_embedding(content)
        
        doc_entry = {
            "id": doc_id,
            "title": title,
            "content": content,
            "category": category,
            "vector": vector
        }
        self.brand_docs[user_id].append(doc_entry)
        logger.info(f"Added Brand Voice RAG document '{title}' for user {user_id}")
        return doc_entry

    def get_relevant_brand_context(self, user_id: str, prompt_topic: str, top_k: int = 2) -> str:
        """
        Retrieves top relevant brand voice guidelines and exemplars for LLM prompt context
        """
        user_knowledge = self.brand_docs.get(user_id, [])
        if not user_knowledge:
            return ""

        query_vec = self._simple_text_embedding(prompt_topic)

        # Compute cosine similarity
        scored_docs = []
        for doc in user_knowledge:
            doc_vec = doc["vector"]
            dot_product = sum(q * d for q, d in zip(query_vec, doc_vec))
            scored_docs.append((dot_product, doc["content"]))

        # Sort by similarity score descending
        scored_docs.sort(key=lambda x: x[0], reverse=True)
        top_matches = [d[1] for d in scored_docs[:top_k] if d[0] > 0]

        if not top_matches:
            top_matches = [doc["content"] for doc in user_knowledge[:top_k]]

        context_block = "\n".join([f"- {m}" for m in top_matches])
        return f"\n\n[USER BRAND VOICE & GUIDELINES]\nFollow these specific tone rules and terminology:\n{context_block}"

rag_service = RAGBrandVoiceService()
