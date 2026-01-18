// web/public/audio-processor.js

class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // Buffer to hold audio data until we have enough to send (optional optimization)
    // For real-time, we usually send chunks as they come.
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input.length) return true;

    const channelData = input[0]; // Mono audio (1st channel)
    
    // 1. Convert Float32 (-1.0 to 1.0) -> Int16 (-32768 to 32767)
    // This is the heavy math we are moving off the main thread
    const pcmData = new Int16Array(channelData.length);
    
    for (let i = 0; i < channelData.length; i++) {
        const sample = Math.max(-1, Math.min(1, channelData[i])); // Clamp
        pcmData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }

    // 2. Send the Int16 buffer to the Main Thread
    // We use the 'transfer' list (2nd argument) to move memory instantly without copying
    this.port.postMessage(pcmData.buffer, [pcmData.buffer]);

    return true; // Keep processor alive
  }
}

registerProcessor('pcm-processor', PCMProcessor);