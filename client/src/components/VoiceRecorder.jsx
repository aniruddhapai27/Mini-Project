import { useState, useRef, useEffect } from "react";
import {
  isVoiceRecordingSupported,
  startRecording,
  stopRecording,
  voiceToText,
} from "../utils/voiceToText";

const VoiceRecorder = ({
  onTranscript,
  onError,
  disabled = false,
  className = "",
  size = "w-10 h-10",
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    setIsSupported(isVoiceRecordingSupported());
  }, []);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current) {
        stopRecording(mediaRecorderRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecordingTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartRecording = async () => {
    try {
      setIsRecording(true);
      startTimer();

      mediaRecorderRef.current = await startRecording(
        async (audioBlob) => {
          // Process the audio blob
          setIsRecording(false);
          stopTimer();
          setIsProcessing(true);

          try {
            const transcriptText = await voiceToText(audioBlob);
            if (onTranscript) {
              onTranscript(transcriptText);
            }
          } catch (error) {
            console.error("Failed to convert voice to text:", error);
            if (onError) {
              onError(error);
            }
          } finally {
            setIsProcessing(false);
          }
        },
        (error) => {
          console.error("Recording error:", error);
          setIsRecording(false);
          stopTimer();
          if (onError) {
            onError(error);
          }
        }
      );

      // Start recording
      mediaRecorderRef.current.start();
    } catch (error) {
      console.error("Failed to start recording:", error);
      setIsRecording(false);
      stopTimer();
      if (onError) {
        onError(error);
      }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      stopRecording(mediaRecorderRef.current);
    }
  };

  const handleClick = () => {
    if (disabled || isProcessing) return;

    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={`${size} ${className} relative rounded-full flex items-center justify-center transition-all duration-300 ${
          isRecording
            ? "bg-red-500 hover:bg-red-600 animate-pulse"
            : isProcessing
            ? "bg-yellow-500 cursor-not-allowed"
            : "bg-gray-600 hover:bg-gray-700"
        } ${disabled || isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
        title={
          isRecording
            ? "Click to stop recording"
            : isProcessing
            ? "Processing..."
            : "Click to start voice recording"
        }
      >
        {isProcessing ? (
          // Processing spinner
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : isRecording ? (
          // Recording icon (stop square)
          <svg
            className="w-4 h-4 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <rect x="6" y="6" width="12" height="12" />
          </svg>
        ) : (
          // Microphone icon
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
          </svg>
        )}

        {/* Recording indicator dot */}
        {isRecording && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
        )}
      </button>

      {/* Recording timer */}
      {isRecording && (
        <span className="text-xs text-red-400 font-mono animate-pulse">
          {formatTime(recordingTime)}
        </span>
      )}

      {/* Processing indicator */}
      {isProcessing && (
        <span className="text-xs text-yellow-400">Converting...</span>
      )}
    </div>
  );
};

export default VoiceRecorder;
