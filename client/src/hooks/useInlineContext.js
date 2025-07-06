import { useRef, useEffect, useState } from "react";

/**
 * Hook to detect if component is inside a paragraph or inline context
 * This helps prevent HTML validation errors when using loaders
 */
export const useInlineContext = () => {
  const ref = useRef(null);
  const [isInline, setIsInline] = useState(false);

  useEffect(() => {
    if (ref.current) {
      // Check if any parent element is a paragraph
      let parent = ref.current.parentElement;
      while (parent) {
        if (parent.tagName === "P") {
          setIsInline(true);
          break;
        }
        parent = parent.parentElement;
      }
    }
  }, []);

  return { ref, isInline };
};

/**
 * Safe loader component that automatically adapts to its context
 */
import React from "react";
import DotLottieLoader from "./DotLottieLoader";
import InlineLoader from "./InlineLoader";

const SmartLoader = ({
  size = "w-4 h-4",
  variant = "dots",
  text = "",
  className = "",
  ...props
}) => {
  const { ref, isInline } = useInlineContext();

  return (
    <span ref={ref} className={className}>
      {isInline ? (
        <InlineLoader size={size} variant={variant} {...props} />
      ) : (
        <DotLottieLoader
          size={size}
          text={text}
          className="inline-flex"
          {...props}
        />
      )}
    </span>
  );
};

export default SmartLoader;
