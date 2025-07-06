import React, { useState, useEffect, useRef } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import PureCSSLoader from "./PureCSSLoader";

const DotLottieLoader = ({
  size = "w-16 h-16",
  className = "",
  text = "",
  textSize = "text-sm",
  textColor = "text-gray-400",
  layout = "vertical", // 'vertical' or 'horizontal'
  tryExternal = false, // Only try external sources if explicitly requested
}) => {
  const [useCSSFallback, setUseCSSFallback] = useState(!tryExternal);
  const timeoutRef = useRef(null);

  // Simple embedded animation (base64 encoded, no external dependency)
  const embeddedAnimation =
    "data:application/json;base64,eyJ2IjoiNS45LjYiLCJmciI6MjQsImlwIjowLCJvcCI6MjQsInciOjcyLCJoIjo3MiwiYXNzZXRzIjpbXSwibGF5ZXJzIjpbeyJkYWRkIjowLCJpbmQiOjEsInR5IjozLCJubSI6IkxheWVyIDEiLCJzciI6MSwic3QiOjAsIm9wIjoyNCwibWFza3MiOltdLCJzaGFwZXMiOlt7InR5IjoiZ3IiLCJpdCI6W3siZCI6MSwibyI6eyJhIjowLCJrIjoxMDB9LCJzIjp7ImEiOjAsImsiOjIwMH0sImciOnsiYSI6MCwiayI6W1swLDEsMSwyNTUsNTEsMS4yNSwxLjI1LDI1NV0sMSwxLDEsMjU1XX19LHt9XX0seyJ0eSI6InRyIiwicCI6eyJhIjowLCJrIjpbMzYsMzZdfSwiciI6eyJhIjowLCJrIjozNn19LHsidHkiOiJmbCIsImMiOnsiYSI6MCwiayI6WzEsMSwxLDFdfSwiciI6MX0seyJ0eSI6InRyIiwicCI6eyJhIjowLCJrIjpbMCwwXX0sImEiOnsiYSI6MCwiayI6WzAsMF19LCJzIjp7ImEiOjAsImsiOlsxMDAsMTAwXX0sInIiOnsiYSI6MSwiayI6W3sidCI6MCwicyI6WzBdLCJpIjp7IngiOlswLjgzM10sInkiOlsxXX0sIm8iOnsieCi6WzAuMTY3XSwieSI6WzBdfX0seyJ0Ijo5LCJzIjpbMzYwXX1dfX1dfV19XX0=";

  const isHorizontal =
    layout === "horizontal" || className.includes("flex-row");

  const handleError = (error) => {
    console.log(
      "External Lottie failed, using CSS fallback:",
      error?.message || error
    );
    setUseCSSFallback(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleLoad = () => {
    console.log("External Lottie loaded successfully");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    // Reset state when props change
    setUseCSSFallback(!tryExternal);

    // If trying external, set a quick timeout
    if (tryExternal) {
      timeoutRef.current = setTimeout(() => {
        console.log("Lottie load timeout, using CSS fallback");
        setUseCSSFallback(true);
      }, 1000); // 1 second timeout
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [tryExternal, size, className]);

  const getVariant = () => {
    const sizeClass = size.split(" ")[0];
    const sizeNumber = parseInt(sizeClass.replace("w-", ""));

    if (sizeNumber <= 6) return "dots";
    if (sizeNumber <= 10) return "pulse";
    return "spinner";
  };

  // Detect if this loader is likely to be used inline
  const isInlineContext =
    className.includes("inline") ||
    size.includes("w-3") ||
    size.includes("w-4") ||
    size.includes("w-5");

  // Use span instead of div for small sizes or inline usage
  const Element = isInlineContext ? "span" : "div";
  const display = isInlineContext ? "inline-flex" : "flex";

  return (
    <Element
      className={`${display} ${
        isHorizontal
          ? "flex-row items-center space-x-2"
          : "flex-col items-center justify-center"
      } ${className}`}
    >
      <Element className={`${size} relative`}>
        {useCSSFallback ? (
          <PureCSSLoader
            size={size}
            variant={getVariant()}
            layout={layout}
            inline={isInlineContext}
          />
        ) : (
          <DotLottieReact
            src={embeddedAnimation}
            loop
            autoplay
            onError={handleError}
            onLoad={handleLoad}
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        )}
      </Element>
      {text && (
        <span
          className={`${textSize} ${textColor} ${
            isHorizontal ? "" : isInlineContext ? "ml-2" : "mt-2"
          } text-center ${isInlineContext ? "inline-block" : "block"}`}
        >
          {text}
        </span>
      )}
    </Element>
  );
};

export default DotLottieLoader;
