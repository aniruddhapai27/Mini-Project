import numpy as np
import cv2
import io
import os
import tensorflow as tf
from tensorflow.keras.models import load_model

# Set TensorFlow logging level to hide the messages
tf.get_logger().setLevel('ERROR')
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # 0=all, 1=info, 2=warning, 3=error

current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(os.path.dirname(current_dir), 'models', 'mobilenet_emotion_final.keras')
model = load_model(model_path)

# Load the face cascade classifier
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')


def process_image(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Automatically detect faces and draw rectangles on the image
    faces, image_with_faces = detect_faces(image)
    
    return image_with_faces

def preprocess_image(image, target_size=(224, 224)):
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = cv2.resize(image, target_size)
    image = np.expand_dims(image, axis=0)
    image = image / 255.0 
    return image

def predict_emotion(image):
    # First try to detect and extract a face
    face_img, face_found = extract_face(image)
    
    # If a face is found, use it for prediction, otherwise use the full image
    img_to_process = face_img if face_found else image
    
    preprocessed_image = preprocess_image(img_to_process)
    predictions = model.predict(preprocessed_image)
    
    return predictions

def postprocess_predictions(predictions):
    confidence = predictions[0][0]
    nervousness = predictions[0][1]
    return {
        "confidence": float(confidence),
        "nervousness": float(nervousness)
    }

def detect_faces(image, draw=True, min_neighbors=5, scale_factor=1.1, min_size=(30, 30)):
   
    # Convert to grayscale for face detection
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
        
    # Detect faces
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=scale_factor,
        minNeighbors=min_neighbors,
        minSize=min_size
    )
    
    # Draw rectangles around the faces if requested
    if draw and len(faces) > 0:
        for (x, y, w, h) in faces:
            cv2.rectangle(image, (x, y), (x+w, y+h), (0, 255, 0), 2)
    
    return faces, image

def extract_face(image, padding=20):
    """
    Extract the primary face from an image with padding
    
    Args:
        image: Input image (numpy array in BGR format)
        padding: Number of pixels to add around the face region
    
    Returns:
        face_img: Extracted face region with padding if a face is detected, None otherwise
        face_found: Boolean indicating if a face was detected
    """
    faces, _ = detect_faces(image, draw=False)
    
    if len(faces) == 0:
        return None, False
    
    # Get the largest face by area (width * height)
    largest_face = max(faces, key=lambda rect: rect[2] * rect[3])
    x, y, w, h = largest_face
    
    # Add padding to the face region
    height, width = image.shape[:2]
    x_start = max(0, x - padding)
    y_start = max(0, y - padding)
    x_end = min(width, x + w + padding)
    y_end = min(height, y + h + padding)
    
    face_img = image[y_start:y_end, x_start:x_end]
    return face_img, True