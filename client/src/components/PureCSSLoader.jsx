import React from "react";

// Pure CSS loading animations as a complete fallback
const PureCSSLoader = ({
  size = "w-16 h-16",
  className = "",
  text = "",
  textSize = "text-sm",
  textColor = "text-gray-400",
  layout = "vertical",
  variant = "spinner", // 'spinner', 'dots', 'pulse', 'squares'
  inline = false, // Use inline elements when true
}) => {
  const isHorizontal =
    layout === "horizontal" || className.includes("flex-row");

  // Check if we should use inline elements (detect if inside paragraph)
  const shouldUseInline = inline || className.includes("inline");
  const Element = shouldUseInline ? "span" : "div";
  const display = shouldUseInline ? "inline-flex" : "flex";

  const getAnimation = () => {
    const baseClasses = `${size} ${display} items-center justify-center`;

    switch (variant) {
      case "dots":
        return (
          <Element className={baseClasses}>
            <Element className={`${display} space-x-1`}>
              {[0, 1, 2].map((i) => (
                <Element
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce inline-block"
                  style={{ animationDelay: `${i * 150}ms` }}
                ></Element>
              ))}
            </Element>
          </Element>
        );

      case "pulse":
        return (
          <Element className={baseClasses}>
            <Element className="w-8 h-8 bg-blue-500 rounded-full animate-pulse inline-block"></Element>
          </Element>
        );

      case "squares":
        return (
          <Element className={baseClasses}>
            <Element className="relative w-8 h-8 inline-block">
              <Element className="absolute inset-0 border-2 border-blue-500 animate-spin"></Element>
              <Element
                className="absolute inset-1 border-2 border-blue-300 animate-spin"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "1.5s",
                }}
              ></Element>
            </Element>
          </Element>
        );

      case "spinner":
      default:
        return (
          <Element className={baseClasses}>
            <Element className="animate-spin rounded-full border-2 border-gray-200 border-t-blue-500 w-8 h-8 inline-block"></Element>
          </Element>
        );
    }
  };

  return (
    <Element
      className={`${display} ${
        isHorizontal
          ? "flex-row items-center space-x-2"
          : "flex-col items-center justify-center"
      } ${className}`}
    >
      {getAnimation()}
      {text && (
        <span
          className={`${textSize} ${textColor} ${
            isHorizontal ? "" : shouldUseInline ? "ml-2" : "mt-2"
          } text-center ${shouldUseInline ? "inline-block" : "block"}`}
        >
          {text}
        </span>
      )}
    </Element>
  );
};

export default PureCSSLoader;
