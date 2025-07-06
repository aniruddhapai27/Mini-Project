// Example usage of DotLottieLoader in different scenarios
// Now includes error handling and fallback mechanisms

import React from "react";
import DotLottieLoader from "../components/DotLottieLoader";
import RobustDotLottieLoader from "../components/RobustDotLottieLoader";
import PureCSSLoader from "../components/PureCSSLoader";

const ExampleUsages = () => {
  const isLoading = true; // Example state

  return (
    <div className="space-y-8 p-4">
      <h2 className="text-xl font-bold">DotLottie Loader Examples</h2>

      {/* 1. Basic loading screen with error handling */}
      <div className="border p-4 rounded">
        <h3 className="text-lg mb-2">Basic Loading Screen</h3>
        <DotLottieLoader
          size="w-20 h-20"
          text="Loading..."
          textSize="text-lg"
          textColor="text-white"
        />
      </div>

      {/* 2. Small inline loader */}
      <div className="border p-4 rounded">
        <h3 className="text-lg mb-2">Small Inline Loader</h3>
        <div className="flex items-center space-x-2">
          <span>Processing</span>
          <DotLottieLoader size="w-6 h-6" />
        </div>
      </div>

      {/* 3. Horizontal layout */}
      <div className="border p-4 rounded">
        <h3 className="text-lg mb-2">Horizontal Layout</h3>
        <DotLottieLoader
          size="w-8 h-8"
          text="Processing..."
          layout="horizontal"
          textSize="text-sm"
        />
      </div>

      {/* 4. Button loading state */}
      <div className="border p-4 rounded">
        <h3 className="text-lg mb-2">Button Loading State</h3>
        <button className="bg-blue-500 text-white px-4 py-2 rounded flex items-center space-x-2">
          {isLoading ? (
            <>
              <DotLottieLoader size="w-5 h-5" />
              <span>Loading...</span>
            </>
          ) : (
            <span>Submit</span>
          )}
        </button>
      </div>

      {/* 5. Card loading placeholder */}
      <div className="border p-4 rounded">
        <h3 className="text-lg mb-2">Card Loading Placeholder</h3>
        <div className="bg-gray-100 p-4 text-center rounded">
          <DotLottieLoader
            size="w-12 h-12"
            text="Loading content..."
            textColor="text-gray-500"
          />
        </div>
      </div>

      {/* 6. Robust version with enhanced error handling */}
      <div className="border p-4 rounded">
        <h3 className="text-lg mb-2">Robust Version</h3>
        <RobustDotLottieLoader
          size="w-16 h-16"
          text="Enhanced error handling"
          textColor="text-blue-600"
        />
      </div>

      {/* 7. Pure CSS fallback options */}
      <div className="border p-4 rounded">
        <h3 className="text-lg mb-2">Pure CSS Fallbacks</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <PureCSSLoader variant="spinner" text="Spinner" />
          </div>
          <div className="text-center">
            <PureCSSLoader variant="dots" text="Dots" />
          </div>
          <div className="text-center">
            <PureCSSLoader variant="pulse" text="Pulse" />
          </div>
          <div className="text-center">
            <PureCSSLoader variant="squares" text="Squares" />
          </div>
        </div>
      </div>

      {/* 8. Different sizes demonstration */}
      <div className="border p-4 rounded">
        <h3 className="text-lg mb-2">Different Sizes</h3>
        <div className="flex items-center space-x-4">
          <DotLottieLoader size="w-4 h-4" text="Small" textSize="text-xs" />
          <DotLottieLoader size="w-8 h-8" text="Medium" textSize="text-sm" />
          <DotLottieLoader size="w-16 h-16" text="Large" textSize="text-lg" />
        </div>
      </div>
    </div>
  );
};

export default ExampleUsages;
