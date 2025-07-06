/**
 * Voice-to-Text utility for converting audio recordings to text
 * Integrates with the backend voice-to-text endpoint
 */

const API_BASE_URL =
  import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:5000";

/**
 * Convert audio blob to text using the backend API
 * @param {Blob} audioBlob - The audio blob to convert to text
 * @returns {Promise<string>} - The transcribed text
 */
export const voiceToText = async (audioBlob) => {
  try {
    if (!audioBlob) {
      throw new Error("Audio blob is required");
    }

    // Create FormData to send audio file
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");

    const response = await fetch(
      `${API_BASE_URL}/api/v1/interview/voice-to-text`,
      {
        method: "POST",
        credentials: "include", // Include cookies for authentication
        body: formData, // Don't set Content-Type header, let browser set it with boundary
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data.data.text;
  } catch (error) {
    console.error("Voice-to-text error:", error);
    throw error;
  }
};

/**
 * Check if voice recording is supported in the browser
 * @returns {boolean} - Whether voice recording is supported
 */
export const isVoiceRecordingSupported = () => {
  return (
    typeof navigator !== "undefined" &&
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    typeof MediaRecorder !== "undefined"
  );
};

/**
 * Start recording audio from the microphone
 * @param {function} onDataAvailable - Callback when audio data is available
 * @param {function} onError - Callback when an error occurs
 * @returns {Promise<MediaRecorder>} - MediaRecorder instance for control
 */
export const startRecording = async (onDataAvailable, onError) => {
  try {
    if (!isVoiceRecordingSupported()) {
      throw new Error("Voice recording is not supported in this browser");
    }

    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    // Create MediaRecorder
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4",
    });

    const audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      // Stop all tracks to release microphone
      stream.getTracks().forEach((track) => track.stop());

      // Create audio blob from chunks
      const audioBlob = new Blob(audioChunks, {
        type: mediaRecorder.mimeType,
      });

      if (onDataAvailable) {
        onDataAvailable(audioBlob);
      }
    };

    mediaRecorder.onerror = (event) => {
      console.error("MediaRecorder error:", event.error);
      if (onError) {
        onError(event.error);
      }
    };

    return mediaRecorder;
  } catch (error) {
    console.error("Failed to start recording:", error);
    if (onError) {
      onError(error);
    }
    throw error;
  }
};

/**
 * Stop recording and return the audio blob
 * @param {MediaRecorder} mediaRecorder - The MediaRecorder instance to stop
 */
export const stopRecording = (mediaRecorder) => {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
};

/**
 * Record audio for a specified duration
 * @param {number} duration - Duration in milliseconds (optional)
 * @param {function} onProgress - Progress callback (optional)
 * @returns {Promise<Blob>} - Audio blob
 */
export const recordAudio = (duration = null, onProgress = null) => {
  return new Promise((resolve, reject) => {
    let progressInterval;
    let startTime;

    const initRecording = async () => {
      try {
        const mediaRecorder = await startRecording(
          (audioBlob) => {
            if (progressInterval) {
              clearInterval(progressInterval);
            }
            resolve(audioBlob);
          },
          (error) => {
            if (progressInterval) {
              clearInterval(progressInterval);
            }
            reject(error);
          }
        );

        // Start recording
        mediaRecorder.start();
        startTime = Date.now();

        // Set up progress tracking if callback provided
        if (onProgress && duration) {
          progressInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min((elapsed / duration) * 100, 100);
            onProgress(progress);
          }, 100);
        }

        // Auto-stop after duration if specified
        if (duration) {
          setTimeout(() => {
            stopRecording(mediaRecorder);
          }, duration);
        }

        // Return the mediaRecorder so it can be manually stopped
        return mediaRecorder;
      } catch (error) {
        reject(error);
      }
    };

    initRecording();
  });
};
