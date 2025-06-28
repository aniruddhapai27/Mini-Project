import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const DotLottieLoader = ({ 
  size = 'w-16 h-16', 
  className = '', 
  text = '',
  textSize = 'text-sm',
  textColor = 'text-gray-400',
  layout = 'vertical' // 'vertical' or 'horizontal'
}) => {
  const isHorizontal = layout === 'horizontal' || className.includes('flex-row');
  
  return (
    <div className={`flex ${isHorizontal ? 'flex-row items-center space-x-2' : 'flex-col items-center justify-center'} ${className}`}>
      <div className={size}>
        <DotLottieReact
          src="https://lottie.host/7a552840-82f6-4581-beee-d40bdb36d0c8/Juns0LLiNy.lottie"
          loop
          autoplay
        />
      </div>
      {text && (
        <p className={`${textSize} ${textColor} ${isHorizontal ? '' : 'mt-2'} text-center`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default DotLottieLoader;
