import json
import regex as re
from PyPDF2 import PdfReader
from docx import Document

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
    

    