
import { pipeline, env } from '@xenova/transformers';

// Configuration to load models from LOCAL project files (public/models)
env.allowLocalModels = false;
env.allowRemoteModels = true; // Treats local server as remote in browser context
env.remoteHost = '/models/'; // Points to http://localhost:PORT/models/
env.remotePathTemplate = '{model}/'; // Expected structure: /models/Xenova/whisper-base/...

class WhisperWorker {
  static instance = null;

  static async getInstance(progressCallback) {
    if (this.instance === null) {
      // Load from local folder: public/models/Xenova/whisper-base
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
          self.postMessage({ status: 'loading', message: 'Memuat model Whisper Base (Local Project)...' });
          
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
