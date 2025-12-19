
import { pipeline, env } from '@xenova/transformers';

// Configuration to load models from CDN (HuggingFace)
env.allowLocalModels = false;
env.useBrowserCache = true;

class WhisperWorker {
  static instance = null;

  static async getInstance(progressCallback) {
    if (this.instance === null) {
      // Load from HuggingFace Hub (Online)
      this.instance = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base', { 
        quantized: true,
        progress_callback: progressCallback 
      });
    }
    return this.instance;
  }
}

self.addEventListener('message', async (event) => {
  const { type, audio } = event.data;

  if (type === 'load') {
      try {
          self.postMessage({ status: 'loading', message: 'Mengunduh model Whisper Base (Online CDN)...' });
          
          await WhisperWorker.getInstance((data) => {
              // Relay download progress
               if (data.status === 'progress') {
                   self.postMessage({ status: 'downloading', detail: data });
               }
          });
          
          self.postMessage({ status: 'ready', message: 'Whisper AI Siap.' });
      } catch (e) {
          console.error(e);
          self.postMessage({ status: 'error', message: 'Gagal memuat model: ' + e.message });
      }
      return;
  }

  if (type === 'transcribe') {
      try {
          const transcriber = await WhisperWorker.getInstance();
          
          self.postMessage({ status: 'processing', message: 'Menganalisis audio...' });
          
          const output = await transcriber(audio, {
            language: 'indonesian',
            task: 'transcribe',
            // Tuning strategies:
            beam_size: 2,         // Better accuracy than greedy (1)
            temperature: 0,       // Deterministic output
            no_speech_threshold: 0.6 // Ignore silence/noise better
          });
          
          self.postMessage({ status: 'complete', text: output.text });
      } catch (e) {
          console.error(e);
          self.postMessage({ status: 'error', message: 'Error transkripsi: ' + e.message });
      }
  }
});
