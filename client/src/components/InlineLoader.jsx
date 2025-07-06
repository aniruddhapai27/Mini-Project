import React from "react";

/**
 * InlineLoader - A safe loader component that can be used inside <p> tags
 * Uses only inline elements (span) to avoid HTML validation errors
 */
const InlineLoader = ({
  size = "w-4 h-4",
  variant = "dots", // 'dots', 'spinner', 'pulse'
  className = "",
  color = "blue-500",
}) => {
  const getAnimation = () => {
    switch (variant) {
      case "dots":
        return (
          <span
            className={`${size} inline-flex items-center justify-center space-x-0.5`}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`w-1 h-1 bg-${color} rounded-full animate-bounce inline-block`}
                style={{
                  animationDelay: `${i * 150}ms`,
                  animationDuration: "1s",
                }}
              ></span>
            ))}
          </span>
        );

      case "pulse":
        return (
          <span className={`${size} inline-flex items-center justify-center`}>
            <span
              className={`w-2 h-2 bg-${color} rounded-full animate-pulse inline-block`}
            ></span>
          </span>
        );

      case "spinner":
      default:
        return (
          <span className={`${size} inline-flex items-center justify-center`}>
            <span
              className={`animate-spin rounded-full border border-gray-200 border-t-${color} w-3 h-3 inline-block`}
            ></span>
          </span>
        );
    }
  };

  return (
    <span className={`inline-flex items-center ${className}`}>
      {getAnimation()}
    </span>
  );
};

export default InlineLoader;
