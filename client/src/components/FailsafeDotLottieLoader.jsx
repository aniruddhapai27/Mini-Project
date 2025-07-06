import React from "react";
import PureCSSLoader from "./PureCSSLoader";

/**
 * FailsafeDotLottieLoader - 100% reliable loader that never fails
 * Uses only CSS animations, no external dependencies
 */
const FailsafeDotLottieLoader = ({
  size = "w-16 h-16",
  className = "",
  text = "",
  textSize = "text-sm",
  textColor = "text-gray-400",
  layout = "vertical",
}) => {
  const isHorizontal =
    layout === "horizontal" || className.includes("flex-row");

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
      <PureCSSLoader size={size} variant={getVariant()} layout={layout} />
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

export default FailsafeDotLottieLoader;
