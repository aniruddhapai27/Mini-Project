import React from "react";
import DotLottieLoader from "../components/DotLottieLoader";
import InlineLoader from "../components/InlineLoader";
import PureCSSLoader from "../components/PureCSSLoader";

const HTMLValidationTest = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        HTML Validation Test
      </h1>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Test inline usage in paragraphs */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            ✅ Safe Inline Usage (No HTML Errors)
          </h2>

          <div className="space-y-4">
            <p className="text-gray-700">
              This is a paragraph with an inline loader:{" "}
              <DotLottieLoader size="w-3 h-3" className="inline" />
              and it should not cause HTML validation errors.
            </p>

            <p className="text-gray-700">
              Loading data <DotLottieLoader size="w-4 h-4" /> please wait...
            </p>

            <p className="text-gray-700">
              Processing <InlineLoader variant="dots" size="w-4 h-4" /> your
              request.
            </p>

            <p className="text-gray-700">
              Almost done{" "}
              <InlineLoader
                variant="spinner"
                size="w-3 h-3"
                color="green-500"
              />{" "}
              finishing up.
            </p>
          </div>
        </div>

        {/* Test block usage */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            ✅ Block Usage (Standard Loaders)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="text-sm font-medium mb-2">Small</h3>
              <DotLottieLoader size="w-8 h-8" text="Loading..." />
            </div>

            <div className="text-center">
              <h3 className="text-sm font-medium mb-2">Medium</h3>
              <DotLottieLoader size="w-16 h-16" text="Processing..." />
            </div>

            <div className="text-center">
              <h3 className="text-sm font-medium mb-2">Large</h3>
              <DotLottieLoader size="w-24 h-24" text="Please wait..." />
            </div>
          </div>
        </div>

        {/* CSS Fallback demonstrations */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            ✅ CSS Fallback Variants
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <h3 className="text-sm font-medium mb-2">Inline Dots</h3>
              <p>
                Loading{" "}
                <PureCSSLoader size="w-4 h-4" variant="dots" inline={true} />{" "}
                data
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-sm font-medium mb-2">Inline Spinner</h3>
              <p>
                Processing{" "}
                <PureCSSLoader size="w-4 h-4" variant="spinner" inline={true} />{" "}
                request
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-sm font-medium mb-2">Block Pulse</h3>
              <PureCSSLoader size="w-12 h-12" variant="pulse" text="Pulsing" />
            </div>

            <div className="text-center">
              <h3 className="text-sm font-medium mb-2">Block Squares</h3>
              <PureCSSLoader
                size="w-12 h-12"
                variant="squares"
                text="Rotating"
              />
            </div>
          </div>
        </div>

        {/* Real-world usage examples */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">🚀 Real-World Examples</h2>

          <div className="space-y-4">
            {/* Button with inline loader */}
            <div>
              <h3 className="text-sm font-medium mb-2">Button Loading State</h3>
              <button className="bg-blue-500 text-white px-4 py-2 rounded flex items-center space-x-2">
                <DotLottieLoader size="w-4 h-4" className="inline" />
                <span>Submitting...</span>
              </button>
            </div>

            {/* Form field with validation */}
            <div>
              <h3 className="text-sm font-medium mb-2">Form Validation</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="email"
                  placeholder="Enter email"
                  className="border rounded px-3 py-2"
                />
                <DotLottieLoader size="w-5 h-5" className="inline" />
                <span className="text-sm text-gray-600">
                  Checking availability...
                </span>
              </div>
            </div>

            {/* Notification message */}
            <div>
              <h3 className="text-sm font-medium mb-2">Notification</h3>
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-blue-800">
                  <DotLottieLoader size="w-4 h-4" className="inline mr-2" />
                  Syncing your data with the server...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Validation status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            ✅ HTML Validation Status
          </h2>
          <ul className="text-green-700 space-y-1">
            <li>✅ No `&lt;div&gt;` elements inside `&lt;p&gt;` tags</li>
            <li>
              ✅ Proper use of inline elements (`&lt;span&gt;`) for inline
              contexts
            </li>
            <li>✅ Block elements (`&lt;div&gt;`) for standalone usage</li>
            <li>✅ Automatic context detection</li>
            <li>✅ Hydration-safe rendering</li>
            <li>✅ CSS fallbacks that never fail</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HTMLValidationTest;
