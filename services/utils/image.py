import numpy as np
import cv2
from tensorflow.keras.models import load_model
import io
import os

# Get the absolute path to the model file
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(os.path.dirname(current_dir), 'models', 'emotion_model_checkpoint.keras')
model = load_model(model_path)


def process_image(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return image

def preprocess_image(image, target_size=(224, 224)):
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = cv2.resize(image, target_size)
    image = np.expand_dims(image, axis=0)
    image = image / 255.0 
    return image

def predict_emotion(image):
    preprocessed_image = preprocess_image(image)
    predictions = model.predict(preprocessed_image)
    return predictions

def postprocess_predictions(predictions):
    confidence = predictions[0][0]
    nervousness = predictions[0][1]
    return {
        "confidence": float(confidence),
        "nervousness": float(nervousness)
    }