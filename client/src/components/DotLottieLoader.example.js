// Example usage of DotLottieLoader in different scenarios

import React from 'react';
import DotLottieLoader from '../components/DotLottieLoader';

const ExampleUsages = () => {
  const isLoading = true; // Example state
  
  return (
    <div>
      {/* 1. Basic loading screen */}
      <DotLottieLoader 
        size="w-20 h-20"
        text="Loading..."
        textSize="text-lg"
        textColor="text-white"
      />

      {/* 2. Small inline loader */}
      <DotLottieLoader size="w-6 h-6" />

      {/* 3. Horizontal layout (for thinking animations) */}
      <DotLottieLoader 
        size="w-8 h-8"
        text="Processing..."
        layout="horizontal"
        textSize="text-sm"
      />

      {/* 4. Button loading state */}
      {isLoading ? (
        <DotLottieLoader size="w-5 h-5" />
      ) : (
        <span>Submit</span>
      )}

      {/* 5. Card loading placeholder */}
      <div className="p-4 text-center">
        <DotLottieLoader 
          size="w-12 h-12"
          text="Loading content..."
          textColor="text-gray-500"
        />
      </div>
    </div>
  );
};

export default ExampleUsages;
