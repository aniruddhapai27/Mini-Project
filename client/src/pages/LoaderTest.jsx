import React from "react";
import DotLottieLoader from "../components/DotLottieLoader";
import PureCSSLoader from "../components/PureCSSLoader";

const LoaderTest = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Loader Test Page</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* DotLottie Loaders */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">DotLottie Loaders</h2>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Small (w-8 h-8)</p>
              <DotLottieLoader size="w-8 h-8" text="Loading..." />
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Medium (w-16 h-16)</p>
              <DotLottieLoader size="w-16 h-16" text="Processing..." />
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Large (w-24 h-24)</p>
              <DotLottieLoader size="w-24 h-24" text="Please wait..." />
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Horizontal Layout</p>
              <DotLottieLoader
                size="w-12 h-12"
                text="Loading data..."
                layout="horizontal"
                className="justify-center"
              />
            </div>
          </div>
        </div>

        {/* Pure CSS Loaders */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Pure CSS Loaders</h2>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Spinner</p>
              <PureCSSLoader
                size="w-12 h-12"
                variant="spinner"
                text="Spinning..."
              />
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Dots</p>
              <PureCSSLoader
                size="w-12 h-12"
                variant="dots"
                text="Loading..."
              />
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Pulse</p>
              <PureCSSLoader
                size="w-12 h-12"
                variant="pulse"
                text="Pulsing..."
              />
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Squares</p>
              <PureCSSLoader
                size="w-12 h-12"
                variant="squares"
                text="Processing..."
              />
            </div>
          </div>
        </div>

        {/* Test Error Conditions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Error Fallbacks</h2>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Normal DotLottie</p>
              <DotLottieLoader
                size="w-16 h-16"
                text="Should work or fallback to CSS"
              />
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                CSS Fallback (Guaranteed)
              </p>
              <PureCSSLoader
                size="w-16 h-16"
                variant="spinner"
                text="Always works"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-600">
        <p>
          ✅ If you see animations above, the loaders are working correctly!
          <br />
          🔄 DotLottie loaders will automatically fallback to CSS animations if
          external sources fail.
        </p>
      </div>
    </div>
  );
};

export default LoaderTest;
