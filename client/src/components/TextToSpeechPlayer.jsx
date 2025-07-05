import React, { useEffect, useState, useCallback } from "react";
import { FaPlay, FaPause, FaStop, FaVolumeUp, FaSpinner } from "react-icons/fa";
import useTextToSpeech from "../hooks/useTextToSpeech";

const TextToSpeechPlayer = ({
  text,
  autoPlay = false,
  voice = "Aaliyah-PlayAI",
  className = "",
  showControls = true,
  onPlayStart,
  onPlayEnd,
  onError,
}) => {
  const { speak, stop, pause, resume, isLoading, isPlaying, error } =
    useTextToSpeech();
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);

  const handlePlay = useCallback(async () => {
    if (!text || text.trim().length === 0) return;
    await speak(text, voice);
  }, [text, voice, speak]);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && text && !hasAutoPlayed && !isLoading && !isPlaying) {
      setHasAutoPlayed(true);
      // Add a small delay to avoid autoplay issues
      const timer = setTimeout(() => {
        handlePlay();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, text, hasAutoPlayed, isLoading, isPlaying, handlePlay]);

  // Reset auto-play flag when text changes
  useEffect(() => {
    setHasAutoPlayed(false);
  }, [text]);

  // Handle play/pause callbacks
  useEffect(() => {
    if (isPlaying && onPlayStart) {
      onPlayStart();
    } else if (!isPlaying && !isLoading && onPlayEnd) {
      onPlayEnd();
    }
  }, [isPlaying, isLoading, onPlayStart, onPlayEnd]);

  // Handle error callback
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  const handlePause = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const handleStop = () => {
    stop();
  };

  if (!showControls && autoPlay) {
    // Return invisible component that auto-plays
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Play/Pause Button */}
      <button
        onClick={isPlaying ? handlePause : handlePlay}
        disabled={isLoading || !text}
        className={`
          p-2 rounded-full transition-colors duration-200
          ${
            isLoading || !text
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg"
          }
        `}
        title={isPlaying ? "Pause" : "Play"}
      >
        {isLoading ? (
          <FaSpinner className="animate-spin w-4 h-4" />
        ) : isPlaying ? (
          <FaPause className="w-4 h-4" />
        ) : (
          <FaPlay className="w-4 h-4" />
        )}
      </button>

      {/* Stop Button */}
      {(isPlaying || isLoading) && (
        <button
          onClick={handleStop}
          className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors duration-200 shadow-md hover:shadow-lg"
          title="Stop"
        >
          <FaStop className="w-4 h-4" />
        </button>
      )}

      {/* Volume Indicator */}
      {isPlaying && (
        <div className="flex items-center gap-1 text-blue-500">
          <FaVolumeUp className="w-4 h-4" />
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-1 bg-blue-500 rounded-full animate-pulse`}
                style={{
                  height: `${12 + i * 4}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="text-red-500 text-xs bg-red-50 px-2 py-1 rounded border border-red-200">
          {error}
        </div>
      )}

      {/* Text Length Indicator (for long texts) */}
      {text && text.length > 100 && (
        <span className="text-xs text-gray-500">
          ~{Math.ceil(text.length / 200)}s
        </span>
      )}
    </div>
  );
};

export default TextToSpeechPlayer;
