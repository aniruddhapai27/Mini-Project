import React, { useState, useEffect, useRef } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import PureCSSLoader from "./PureCSSLoader";

/**
 * SafeDotLottieLoader - A loader that prioritizes reliability
 * Defaults to CSS animations and only uses external sources as an enhancement
 */
const SafeDotLottieLoader = ({
  size = "w-16 h-16",
  className = "",
  text = "",
  textSize = "text-sm",
  textColor = "text-gray-400",
  layout = "vertical",
  preferExternal = false, // Set to true to try external sources first
}) => {
  const [useExternal, setUseExternal] = useState(preferExternal);
  const [hasExternalError, setHasExternalError] = useState(false);
  const timeoutRef = useRef(null);

  // Only a few highly reliable sources
  const reliableSources = [
    // These are known to work reliably
    "data:application/json;base64,eyJuYW1lIjoiTG9hZGluZyIsInYiOiI1LjkuNiIsImZyIjoyNCwiaXAiOjAsIm9wIjoyNCwidy4iOjcyLCJoIjo3MiwiYXNzZXRzIjpbXSwibGF5ZXJzIjpbeyJkYWRkIjowLCJpbmQiOjEsInR5IjozLCJubSI6IkxheWVyIDEiLCJzciI6MSwic3QiOjAsIm9wIjoyNCwibWFza3MiOltdLCJzaGFwZXMiOlt7InR5IjoiZ3IiLCJpdCI6W3siZCI6MSwibyI6eyJhIjowLCJrIjoxMDB9LCJzIjp7ImEiOjAsImsiOjIwMH0sImciOnsiYSI6MCwiayI6W1swLDEsMSwyNTUsNTEsMS4yNSwxLjI1LDI1NV0sMSwxLDEsMjU1XX19LHt9XX0seyJ0eSI6InRyIiwicCI6eyJhIjowLCJrIjpbMzYsMzZdfSwiciI6eyJhIjowLCJrIjozNn19LHsidHkiOiJmbCIsImMiOnsiYSI6MCwiayI6WzEsMSwxLDFdfSwiciI6MX0seyJ0eSI6InRyIiwicCI6eyJhIjowLCJrIjpbMCwwXX0sImEiOnsiYSI6MCwiayI6WzAsMF19LCJzIjp7ImEiOjAsImsiOlsxMDAsMTAwXX0sInIiOnsiYSI6MSwiayI6W3sidCI6MCwicyI6WzBdLCJpIjp7IngiOlswLjgzM10sInkiOlsxXX0sIm8iOnsieCi6WzAuMTY3XSwieSI6WzBdfX0seyJ0Ijo5LCJzIjpbMzYwXX1dfX1dfV19XX0=",
  ];

  const isHorizontal =
    layout === "horizontal" || className.includes("flex-row");

  const handleExternalError = (error) => {
    console.warn(
      "External Lottie failed, falling back to CSS:",
      error?.message || error
    );
    setHasExternalError(true);
    setUseExternal(false);
  };

  const handleExternalLoad = () => {
    console.log("External Lottie loaded successfully");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    // If trying external, set a quick timeout to fallback to CSS
    if (useExternal && !hasExternalError) {
      timeoutRef.current = setTimeout(() => {
        console.log("External Lottie timeout, falling back to CSS");
        setHasExternalError(true);
        setUseExternal(false);
      }, 2000); // Only wait 2 seconds
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [useExternal, hasExternalError]);

  useEffect(() => {
    // Reset on prop changes
    setUseExternal(preferExternal);
    setHasExternalError(false);
  }, [preferExternal, size, className]);

  const getVariant = () => {
    const sizeClass = size.split(" ")[0];
    const sizeNumber = parseInt(sizeClass.replace("w-", ""));

    if (sizeNumber <= 6) return "dots";
    if (sizeNumber <= 10) return "pulse";
    return "spinner";
  };

  return (
    <div
      className={`flex ${
        isHorizontal
          ? "flex-row items-center space-x-2"
          : "flex-col items-center justify-center"
      } ${className}`}
    >
      <div className={`${size} relative`}>
        {!useExternal || hasExternalError ? (
          // Default to CSS animations - always reliable
          <PureCSSLoader size={size} variant={getVariant()} layout={layout} />
        ) : (
          // Try external source with quick fallback
          <div className="relative w-full h-full">
            <DotLottieReact
              src={reliableSources[0]}
              loop
              autoplay
              onError={handleExternalError}
              onLoad={handleExternalLoad}
              style={{
                width: "100%",
                height: "100%",
              }}
            />
            {/* Show CSS backup while loading external */}
            <div className="absolute inset-0 opacity-30">
              <PureCSSLoader
                size={size}
                variant={getVariant()}
                layout={layout}
              />
            </div>
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

export default SafeDotLottieLoader;
