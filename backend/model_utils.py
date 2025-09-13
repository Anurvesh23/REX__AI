# model_utils.py
from sentence_transformers import SentenceTransformer, CrossEncoder
import numpy as np
import faiss

_EMBEDDER = None
_CROSS_ENCODER = None
_GENERATOR = None

def load_embedder():
	global _EMBEDDER
	if _EMBEDDER is None:
		_EMBEDDER = SentenceTransformer('all-MiniLM-L6-v2')
	return _EMBEDDER

def load_cross_encoder():
	global _CROSS_ENCODER
	if _CROSS_ENCODER is None:
		_CROSS_ENCODER = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
	return _CROSS_ENCODER

def load_generator():
	# Placeholder for LLM generator loading (e.g., HuggingFace pipeline)
	global _GENERATOR
	if _GENERATOR is None:
		from transformers import pipeline
		_GENERATOR = pipeline('text-generation', model='gpt2')
	return _GENERATOR

def embed_texts(texts, model=None):
	model = model or load_embedder()
	return model.encode(texts, convert_to_numpy=True)

def build_faiss_index(embeddings):
	dim = embeddings.shape[1]
	index = faiss.IndexFlatL2(dim)
	index.add(embeddings)
	return index

def search_faiss(index, query_emb, top_k=5):
	D, I = index.search(np.array([query_emb]), top_k)
	return I[0], D[0]
