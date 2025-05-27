import json
import regex as re

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