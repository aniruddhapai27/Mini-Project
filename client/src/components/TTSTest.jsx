import React, { useState } from "react";
import TextToSpeechPlayer from "./TextToSpeechPlayer";

const TTSTest = () => {
  const [testText, setTestText] = useState(
    "Hello, this is a test of the text-to-speech functionality."
  );

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Text-to-Speech Test</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Test Text:</label>
        <textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          rows="3"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Text-to-Speech Player:
        </label>
        <TextToSpeechPlayer
          text={testText}
          autoPlay={false}
          showControls={true}
          onError={(error) => {
            console.error("TTS Test Error:", error);
            alert(`TTS Error: ${error}`);
          }}
        />
      </div>
    </div>
  );
};

export default TTSTest;
