import React, { useState, useEffect, useRef } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const RobustDotLottieLoader = ({
  size = "w-16 h-16",
  className = "",
  text = "",
  textSize = "text-sm",
  textColor = "text-gray-400",
  layout = "vertical",
}) => {
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const retryTimeoutRef = useRef(null);

  // Curated list of working Lottie animations
  const animationSources = [
    // Simple loading animations that are more likely to work
    "https://lottie.host/embed/ba0b3fd3-8ee2-4b65-b0b8-bb45e73c9fb5/D29ZbdBbpr.json",
    "https://lottie.host/embed/5b6ce249-2246-4c69-8e20-1c9d7f9e6f8a/gZXBDqO5yB.json",
    "https://assets4.lottiefiles.com/packages/lf20_szlepvdj.json",
    "https://assets9.lottiefiles.com/packages/lf20_x62chJ.json",
  ];

  const isHorizontal =
    layout === "horizontal" || className.includes("flex-row");

  const handleError = () => {
    console.warn(
      `DotLottie failed for source ${currentSrc + 1}/${animationSources.length}`
    );

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    if (currentSrc < animationSources.length - 1) {
      setCurrentSrc((prev) => prev + 1);
      setIsLoading(true);

      // Add a small delay before trying the next source
      retryTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 500);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Enhanced CSS spinner
  const EnhancedSpinner = () => (
    <div className={`${size} flex items-center justify-center`}>
      <div className="relative">
        <div className="animate-spin rounded-full border-2 border-gray-200 border-t-blue-500 w-8 h-8"></div>
        <div className="absolute inset-0 animate-pulse">
          <div className="w-2 h-2 bg-blue-500 rounded-full absolute top-1 left-1/2 transform -translate-x-1/2"></div>
        </div>
      </div>
    </div>
  );

  // Pulsing dots animation
  const PulsingDots = () => (
    <div className={`${size} flex items-center justify-center`}>
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
            style={{
              animationDelay: `${i * 200}ms`,
              animationDuration: "1s",
            }}
          ></div>
        ))}
      </div>
    </div>
  );

  // Rotating squares
  const RotatingSquares = () => (
    <div className={`${size} flex items-center justify-center`}>
      <div className="relative w-6 h-6">
        <div className="absolute inset-0 border-2 border-blue-500 animate-spin"></div>
        <div
          className="absolute inset-1 border-2 border-blue-300 animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
        ></div>
      </div>
    </div>
  );

  const getFallbackAnimation = () => {
    const sizeClass = size.split(" ")[0]; // Get width class
    const sizeNumber = parseInt(sizeClass.replace("w-", ""));

    if (sizeNumber <= 6) {
      return <PulsingDots />;
    } else if (sizeNumber <= 12) {
      return <RotatingSquares />;
    } else {
      return <EnhancedSpinner />;
    }
  };

  return (
    <div
      className={`flex ${
        isHorizontal
          ? "flex-row items-center space-x-2"
          : "flex-col items-center justify-center"
      } ${className}`}
    >
      <div className={size}>
        {hasError ? (
          getFallbackAnimation()
        ) : (
          <div className="relative w-full h-full">
            <DotLottieReact
              src={animationSources[currentSrc]}
              loop
              autoplay
              onError={handleError}
              onLoad={handleLoad}
              style={{
                width: "100%",
                height: "100%",
                opacity: isLoading ? 0.5 : 1,
                transition: "opacity 0.3s ease",
              }}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        )}
      </div>
      {text && (
        <p
          className={`${textSize} ${textColor} ${
            isHorizontal ? "" : "mt-2"
          } text-center`}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default RobustDotLottieLoader;
