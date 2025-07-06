/**
 * Text-to-Speech utility for converting AI responses to audio
 * Integrates with the backend text-to-speech endpoint
 */

const API_BASE_URL =
  import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:5000";

/**
 * Convert text to speech using the backend API
 * @param {string} text - The text to convert to speech
 * @param {string} voice - The voice to use (default: "Aaliyah-PlayAI")
 * @returns {Promise<Blob>} - Audio blob that can be played
 */
export const textToSpeech = async (text, voice = "Aaliyah-PlayAI") => {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error("Text cannot be empty");
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/interview/text-to-speech`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify({
          text: text.trim(),
          voice: voice,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    // Get the audio data as a blob
    const audioBlob = await response.blob();
    return audioBlob;
  } catch (error) {
    console.error("Text-to-speech error:", error);
    throw error;
  }
};

/**
 * Play audio from text using text-to-speech
 * @param {string} text - The text to convert and play
 * @param {string} voice - The voice to use
 * @param {function} onStart - Callback when audio starts playing
 * @param {function} onEnd - Callback when audio ends
 * @param {function} onError - Callback when an error occurs
 * @returns {Promise<HTMLAudioElement>} - Audio element for control
 */
export const playTextToSpeech = async (
  text,
  voice = "Aaliyah-PlayAI",
  onStart = null,
  onEnd = null,
  onError = null
) => {
  try {
    // Get audio blob from API
    const audioBlob = await textToSpeech(text, voice);

    // Create audio URL
    const audioUrl = URL.createObjectURL(audioBlob);

    // Create audio element
    const audio = new Audio(audioUrl);

    // Set up event listeners
    audio.addEventListener("loadstart", () => {
      if (onStart) onStart();
    });

    audio.addEventListener("ended", () => {
      // Clean up object URL
      URL.revokeObjectURL(audioUrl);
      if (onEnd) onEnd();
    });

    audio.addEventListener("error", (event) => {
      console.error("Audio playback error:", event);
      URL.revokeObjectURL(audioUrl);
      if (onError) onError(event);
    });

    // Play the audio
    await audio.play();

    return audio;
  } catch (error) {
    console.error("Play text-to-speech error:", error);
    if (onError) onError(error);
    throw error;
  }
};

/**
 * Stop and clean up audio
 * @param {HTMLAudioElement} audio - Audio element to stop
 */
export const stopAudio = (audio) => {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    // The object URL will be cleaned up by the ended event listener
  }
};

/**
 * Check if text-to-speech is supported in the browser
 * @returns {boolean} - Whether TTS is supported
 */
export const isTextToSpeechSupported = () => {
  return typeof Audio !== "undefined" && typeof fetch !== "undefined";
};
