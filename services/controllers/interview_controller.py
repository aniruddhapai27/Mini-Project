from utils.image import process_image, predict_emotion, postprocess_predictions

def get_emotions(image_bytes):
    try:
      
        processed_image = process_image(image_bytes)
        predictions = predict_emotion(processed_image)
        result = postprocess_predictions(predictions)
        return result
    except Exception as e:
        return {"error": str(e), "message": "An error occurred while processing the image."}



