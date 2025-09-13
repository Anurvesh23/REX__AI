# module_utils.py
import re

def clean_whitespace(text):
	"""Remove extra whitespace and normalize newlines."""
	return re.sub(r'\s+', ' ', text).strip()

def chunk_text(text, max_length=512, overlap=50):
	"""Split text into overlapping chunks for embedding."""
	words = text.split()
	chunks = []
	i = 0
	while i < len(words):
		chunk = words[i:i+max_length]
		chunks.append(' '.join(chunk))
		i += max_length - overlap
	return chunks
