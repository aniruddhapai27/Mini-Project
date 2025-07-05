import { useState, useRef, useCallback } from "react";
import { pythonAPI } from "../utils/pythonAPI";

const useTextToSpeech = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  const currentAbortController = useRef(null);

  const speak = useCallback(async (text, voice = "Aaliyah-PlayAI") => {
    try {
      console.log("🎤 Starting text-to-speech request:", {
        text: text.substring(0, 50) + "...",
        voice,
      });

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Abort any ongoing request
      if (currentAbortController.current) {
        currentAbortController.current.abort();
      }

      setIsLoading(true);
      setError(null);

      // Create new abort controller for this request
      currentAbortController.current = new AbortController();

      // Make request to FastAPI text-to-speech endpoint via Node.js proxy
      const response = await pythonAPI.post(
        `/api/v1/services/api/v1/interview/text-to-speech`,
        {
          text: text.trim(),
          voice: voice,
        },
        {
          responseType: "blob",
          signal: currentAbortController.current.signal,
          timeout: 30000, // 30 second timeout
          headers: {
            Accept: "audio/wav, audio/*, */*",
          },
        }
      );

      console.log("✅ TTS Response received:", {
        status: response.status,
        contentType: response.headers["content-type"],
        dataSize: response.data.size,
      });

      // Create audio from blob response
      const audioBlob = new Blob([response.data], { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Set up event listeners
      audio.onloadstart = () => setIsLoading(true);
      audio.oncanplay = () => setIsLoading(false);
      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl); // Clean up URL
      };
      audio.onerror = () => {
        setError("Failed to play audio");
        setIsPlaying(false);
        setIsLoading(false);
        URL.revokeObjectURL(audioUrl);
      };

      // Start playing
      await audio.play();
    } catch (err) {
      if (err.name === "AbortError") {
        // Request was aborted, this is expected
        return;
      }

      console.error("Text-to-speech error:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
      });

      let errorMessage = "Failed to generate speech";
      if (err.response?.status === 404) {
        errorMessage = "Text-to-speech service not found";
      } else if (err.response?.status === 503) {
        errorMessage = "Text-to-speech service unavailable";
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
      currentAbortController.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (currentAbortController.current) {
      currentAbortController.current.abort();
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch((err) => {
        console.error("Resume playback error:", err);
        setError("Failed to resume audio playback");
      });
    }
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    stop();
  }, [stop]);

  return {
    speak,
    stop,
    pause,
    resume,
    cleanup,
    isLoading,
    isPlaying,
    error,
  };
};

export default useTextToSpeech;
