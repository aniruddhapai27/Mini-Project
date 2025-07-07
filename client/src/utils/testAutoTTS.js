/**
 * Test utility for auto-playing TTS functionality with preloading
 * Use this to test the preload and auto-play feature
 */

import { playTextToSpeech, isTextToSpeechSupported } from "./textToSpeech.js";

// Test function to verify auto-play TTS functionality with preloading
export const testAutoTTS = async (
  testText = "Hello, this is a test of the automatic text-to-speech feature with preloading for the mock interview."
) => {
  try {
    console.log("🧪 Testing auto-play TTS with preloading...");

    if (!isTextToSpeechSupported()) {
      console.error("❌ Text-to-speech is not supported in this browser");
      return { success: false, error: "TTS not supported" };
    }

    console.log("✅ Text-to-speech is supported");

    // Test preloading
    console.log("🔄 Testing preload functionality...");
    const preloadedAudio = await playTextToSpeech(
      testText,
      "Aaliyah-PlayAI",
      null,
      null,
      (error) => console.error("❌ Preload error:", error),
      true // preloadOnly = true
    );

    console.log("✅ Audio preloaded successfully");

    // Simulate typewriter delay
    console.log("⏳ Simulating typewriter effect delay...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("� Playing preloaded audio...");
    await preloadedAudio.play();

    console.log(
      "✅ Auto-play TTS with preloading test completed successfully!"
    );
    return { success: true, audio: preloadedAudio };
  } catch (error) {
    console.error("❌ Auto-play TTS test failed:", error);
    return { success: false, error: error.message };
  }
};

// Test function to verify timing benefits of preloading
export const testPreloadTiming = async (
  testText = "Testing preload timing benefits."
) => {
  try {
    console.log("⏱️ Testing preload timing benefits...");

    // Test without preloading
    console.log("🔄 Testing without preloading...");
    const startTime1 = performance.now();
    const audio1 = await playTextToSpeech(testText, "Aaliyah-PlayAI");
    const endTime1 = performance.now();
    const timeWithoutPreload = endTime1 - startTime1;
    audio1.pause();

    // Test with preloading
    console.log("🔄 Testing with preloading...");
    const preloadStart = performance.now();
    const preloadedAudio = await playTextToSpeech(
      testText,
      "Aaliyah-PlayAI",
      null,
      null,
      null,
      true
    );
    const preloadEnd = performance.now();
    const preloadTime = preloadEnd - preloadStart;

    const playStart = performance.now();
    await preloadedAudio.play();
    const playEnd = performance.now();
    const playTime = playEnd - playStart;

    console.log("📊 Timing Results:");
    console.log(`   Without preload: ${timeWithoutPreload.toFixed(2)}ms`);
    console.log(
      `   With preload: ${preloadTime.toFixed(
        2
      )}ms (preload) + ${playTime.toFixed(2)}ms (play)`
    );
    console.log(
      `   Benefit: ${(
        ((timeWithoutPreload - playTime) / timeWithoutPreload) *
        100
      ).toFixed(1)}% faster playback`
    );

    return {
      success: true,
      timings: {
        withoutPreload: timeWithoutPreload,
        preloadTime: preloadTime,
        playTime: playTime,
        benefit: ((timeWithoutPreload - playTime) / timeWithoutPreload) * 100,
      },
    };
  } catch (error) {
    console.error("❌ Preload timing test failed:", error);
    return { success: false, error: error.message };
  }
};

// Export for use in browser console
if (typeof window !== "undefined") {
  window.testAutoTTS = testAutoTTS;
  window.testPreloadTiming = testPreloadTiming;
}
