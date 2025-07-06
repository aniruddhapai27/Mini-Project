/**
 * Test utility for voice-to-text functionality
 * Tests the integration between frontend and backend
 */

import {
  voiceToText,
  isVoiceRecordingSupported,
} from "../utils/voiceToText.js";

// Test function to verify voice-to-text functionality
export const testVoiceToText = async () => {
  try {
    console.log("🧪 Testing voice-to-text functionality...");

    if (!isVoiceRecordingSupported()) {
      console.error("❌ Voice recording is not supported in this browser");
      return { success: false, error: "Voice recording not supported" };
    }

    console.log("✅ Voice recording is supported");
    console.log(
      "💡 To test fully, you need to manually trigger voice recording from the UI"
    );

    return { success: true, message: "Voice recording support verified" };
  } catch (error) {
    console.error("❌ Voice-to-text test failed:", error);
    return { success: false, error: error.message };
  }
};

// Test with a mock audio blob (for development)
export const testVoiceToTextWithMockData = async () => {
  try {
    console.log("🧪 Testing voice-to-text with mock data...");

    // Create a small WAV file blob for testing
    const sampleRate = 44100;
    const duration = 1; // 1 second
    const numSamples = sampleRate * duration;
    const arrayBuffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, numSamples * 2, true);

    // Generate a simple tone
    for (let i = 0; i < numSamples; i++) {
      const sample = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.1;
      view.setInt16(44 + i * 2, sample * 32767, true);
    }

    const audioBlob = new Blob([arrayBuffer], { type: "audio/wav" });

    console.log("📤 Sending mock audio to backend...");
    const transcriptText = await voiceToText(audioBlob);

    console.log("✅ Voice-to-text conversion successful:", transcriptText);
    return { success: true, transcript: transcriptText };
  } catch (error) {
    console.error("❌ Voice-to-text mock test failed:", error);
    return { success: false, error: error.message };
  }
};

// Export for use in browser console
if (typeof window !== "undefined") {
  window.testVoiceToText = {
    basic: testVoiceToText,
    mockData: testVoiceToTextWithMockData,
  };
}
