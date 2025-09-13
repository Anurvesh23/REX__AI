# utils.py
import tempfile
import os
import fitz
import docx2txt
import pytesseract
from PIL import Image
import io
import re

def save_upload_to_temp(uploaded_file):
    """Save an uploaded file (FastAPI UploadFile or Streamlit) to a temp file and return path."""
    if hasattr(uploaded_file, 'filename'):
        # FastAPI UploadFile
        suffix = os.path.splitext(uploaded_file.filename)[1]
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        tmp.write(uploaded_file.file.read())
        tmp.flush()
        tmp.close()
        return tmp.name
    else:
        # Streamlit file
        suffix = os.path.splitext(uploaded_file.name)[1]
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        tmp.write(uploaded_file.getbuffer())
        tmp.flush()
        tmp.close()
        return tmp.name

def extract_text_from_path(path, ocr_if_empty=True):
    ext = os.path.splitext(path)[1].lower()
    text = ""
    try:
        if ext == ".pdf":
            doc = fitz.open(path)
            pages = []
            for p in doc:
                pages.append(p.get_text("text"))
            text = "\n".join(pages).strip()
            if ocr_if_empty and (not text or len(text) < 10):
                text = ocr_pdf(path)
        elif ext in [".docx", ".doc"]:
            text = docx2txt.process(path) or ""
        elif ext == ".txt":
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
        else:
            # attempt to open as pdf
            try:
                doc = fitz.open(path)
                text = "\n".join([p.get_text("text") for p in doc]).strip()
            except Exception:
                raise ValueError("Unsupported filetype: " + ext)
    except Exception as e:
        # fallback to OCR for PDFs
        if ext == ".pdf" and ocr_if_empty:
            text = ocr_pdf(path)
        else:
            raise e
    return text

def ocr_pdf(path, dpi=200):
    """Render each PDF page to image and run pytesseract."""
    doc = fitz.open(path)
    text = []
    for i in range(len(doc)):
        pix = doc[i].get_pixmap(dpi=dpi)
        img = Image.open(io.BytesIO(pix.tobytes("png")))
        page_text = pytesseract.image_to_string(img)
        text.append(page_text)
    return "\n".join(text)

def clean_whitespace(text):
    text = re.sub(r'\r\n|\r', '\n', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'\s{2,}', ' ', text)
    return text.strip()

def chunk_text(text, max_words=80, overlap=20):
    """Split text into overlapping chunks of ~max_words using whitespace."""
    words = text.split()
    chunks = []
    i = 0
    n = len(words)
    while i < n:
        j = min(n, i + max_words)
        chunk = " ".join(words[i:j])
        chunks.append(chunk)
        i = j - overlap if j - overlap > i else j
    return chunks
