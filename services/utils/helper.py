import json
import regex as re
from PyPDF2 import PdfReader
from docx import Document
import requests
import io
from fastapi import HTTPException

def extract_json_objects(text: str):
    """
    Extracts all JSON objects from the given text and returns them as a list of dicts.
    """
    # This regex matches JSON objects (non-greedy)
    pattern = r'\{(?:[^{}]|(?R))*\}'
    matches = re.findall(pattern, text, re.DOTALL)
    json_objects = []
    for match in matches:
        try:
            obj = json.loads(match)
            json_objects.append(obj)
        except json.JSONDecodeError:
            continue
    return json_objects


def extract_text(file):
    """Extract text from uploaded file"""
    if file.filename.endswith('.pdf'):
        reader = PdfReader(file.file)
        text = ''
        for page in reader.pages:
            text += page.extract_text() or ''
        return text
    elif file.filename.endswith('.docx'):
        doc = Document(file.file)
        text = ''
        for para in doc.paragraphs:
            text += para.text + '\n'
        return text
    elif file.filename.endswith('.txt'):
        return file.file.read().decode('utf-8')
    return ""


def extract_text_from_url(url: str):
    """Extract text from a file URL (Cloudinary, etc.)"""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        # Get content type
        content_type = response.headers.get('content-type', '').lower()
        
        if 'pdf' in content_type or url.lower().endswith('.pdf'):
            # Handle PDF
            pdf_file = io.BytesIO(response.content)
            reader = PdfReader(pdf_file)
            text = ''
            for page in reader.pages:
                text += page.extract_text() or ''
            return text
            
        elif 'document' in content_type or url.lower().endswith('.docx'):
            # Handle DOCX
            docx_file = io.BytesIO(response.content)
            doc = Document(docx_file)
            text = ''
            for para in doc.paragraphs:
                text += para.text + '\n'
            return text
            
        elif 'text' in content_type or url.lower().endswith('.txt'):
            # Handle plain text
            return response.text
            
        else:
            # Try to read as text anyway
            return response.text
            
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=400, 
            detail=f"Failed to download file from URL: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=400, 
            detail=f"Failed to extract text from file: {str(e)}"
        )


