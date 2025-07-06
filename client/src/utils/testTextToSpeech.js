/**
 * Test script for text-to-speech functionality
 * Tests the integration between frontend and backend
 */

import { textToSpeech, playTextToSpeech } from "../utils/textToSpeech.js";

// Test function to verify TTS functionality
export const testTextToSpeech = async () => {
  try {
    console.log("🧪 Testing text-to-speech functionality...");

    const testText =
      "Hello, this is a test of the text-to-speech functionality for the mock interview application.";

    // Test basic TTS conversion
    console.log("📤 Sending request to backend...");
    const audioBlob = await textToSpeech(testText);

    console.log("✅ Successfully received audio blob:", {
      size: audioBlob.size,
      type: audioBlob.type,
    });

    // Test audio playback
    console.log("🔊 Testing audio playback...");
    const audio = await playTextToSpeech(
      testText,
      "Aaliyah-PlayAI",
      () => console.log("🎵 Audio started playing"),
      () => console.log("🔇 Audio finished playing"),
      (error) => console.error("❌ Audio error:", error)
    );

    console.log("✅ Text-to-speech test completed successfully!");

    return { success: true, audio };
  } catch (error) {
    console.error("❌ Text-to-speech test failed:", error);
    return { success: false, error: error.message };
  }
};

// Test with different voices
export const testDifferentVoices = async () => {
  const voices = ["Aaliyah-PlayAI", "default"];
  const testText = "Testing different voices for text to speech.";

  for (const voice of voices) {
    try {
      console.log(`🗣️ Testing voice: ${voice}`);
      const audioBlob = await textToSpeech(testText, voice);
      console.log(`✅ Voice ${voice} works:`, audioBlob.size, "bytes");
    } catch (error) {
      console.error(`❌ Voice ${voice} failed:`, error.message);
    }
  }
};

// Export for use in browser console
if (typeof window !== "undefined") {
  window.testTTS = {
    basic: testTextToSpeech,
    voices: testDifferentVoices,
  };
}
