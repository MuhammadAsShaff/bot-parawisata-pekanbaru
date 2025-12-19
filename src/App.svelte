<script>
  import { onMount } from 'svelte';
  import { sendMessage } from './lib/api';

  // Atomic Layouts
  import MainLayout from './lib/components/templates/MainLayout.svelte';
  
  // Organisms
  import Sidebar from './lib/components/organisms/Sidebar.svelte';
  import Header from './lib/components/organisms/Header.svelte';
  import ChatWindow from './lib/components/organisms/ChatWindow.svelte';
  import ChatInput from './lib/components/organisms/ChatInput.svelte';

  // State
  let messages = [];
  let inputText = '';
  let isLoading = false;
  let isListening = false;
  let isMuted = false;
  let showSettings = false;
  
  let chatContainer; // Bound to ChatWindow
  let recognition;
  
  // Voice State
  let selectedVoice = null;
  let voiceList = [];
  
  // Session State
  let sessionId = '';
  let sessionExpiryTimer;

  // --- Methods ---

  function initSession() {
    sessionId = 'sess-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    console.log('New Session ID:', sessionId);
    
    if (sessionExpiryTimer) clearTimeout(sessionExpiryTimer);
    sessionExpiryTimer = setTimeout(() => {
        initSession();
        messages = [...messages, { role: 'assistant', text: '⚠️ Sesi chat telah berakhir (15 menit). Memulai sesi baru.' }];
    }, 15 * 60 * 1000); 
  }

  function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    
    let allVoices = window.speechSynthesis.getVoices();
    
    // Helper to check if voice is Indonesian
    const isIndonesian = (v) => v.lang === 'id-ID' || v.lang === 'id_ID' || v.lang.toLowerCase().includes('indones');

    voiceList = allVoices.filter(isIndonesian);

    // If no specific ID voice, fallback to all but try to prioritize somewhat (though less useful)
    if (voiceList.length === 0) {
        console.warn('No Indonesian voices found. Listing all available voices.');
        voiceList = allVoices; 
    }

    if (!selectedVoice && voiceList.length > 0) {
      // Prioritize "Google Bahasa Indonesia" or "Microsoft Gadis" or similar common ones
      selectedVoice = voiceList.find(v => v.name === 'Google Bahasa Indonesia') || 
                      voiceList.find(v => v.name.includes('Indonesia')) ||
                      voiceList[0];
    }
  }

  let isSidebarOpen = true; // Default true for desktop

  let statusMessage = ''; // Debug status

  // --- Whisper WASM State ---
  let whisperWorker = null;
  let isRecording = false;
  let audioContext = null;
  let mediaStream = null;
  let audioInput = null;
  let processor = null;
  let audioChunks = [];
  let isModelReady = false;
  let isModelLoading = false;
  let pendingRecording = false;

  onMount(() => {
     if (window.innerWidth < 768) isSidebarOpen = false;

    initSession();
    loadVoices();
    if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = loadVoices;

    // Initialize Whisper Worker with cache burst to load new online config
    whisperWorker = new Worker(new URL('./lib/whisper-worker.js?v=online_final', import.meta.url), { type: 'module' });
    
    whisperWorker.onmessage = (e) => {
        const { status, message, text } = e.data;
        if (status === 'loading') {
            statusMessage = `⏳ ${message}`;
        } else if (status === 'ready') {
            statusMessage = ''; // Ready silently
            console.log('Whisper Ready');
            isModelReady = true;
            isModelLoading = false;
            if (pendingRecording) {
                pendingRecording = false;
                startRecording();
            }
        } else if (status === 'downloading') {
            const { detail } = e.data;
            if (detail && detail.progress) {
                 const percent = Math.round(detail.progress);
                 statusMessage = `⏳ Mengunduh Model... ${percent}%`;
            }
        } else if (status === 'processing') {
            statusMessage = `🧠 ${message}`;
        } else if (status === 'complete') {
            statusMessage = '';
            inputText = text ? text.trim() : '';
            console.log('Whisper Result:', inputText);
            if (inputText) {
                // Auto-send removed to allow user to review input
                // setTimeout(() => handleSend(), 500);
            } else {
                 statusMessage = '❌ Tidak ada kata yang terdengar.';
            }
        } else if (status === 'error') {
            statusMessage = `❌ ${message}`;
            isRecording = false;
        }
    };
    
    // Lazy Load: Do NOT trigger load immediately
    // whisperWorker.postMessage({ type: 'load' });

    return () => {
        if (whisperWorker) whisperWorker.terminate();
        stopAudioCapture();
    };
  });

  async function startRecording() {
      statusMessage = 'Menyiapkan mikrofon...';
      audioChunks = [];
      try {
          // Advanced Audio Constraints for Clearer Input
          mediaStream = await navigator.mediaDevices.getUserMedia({ 
              audio: {
                  channelCount: 1,
                  echoCancellation: true,
                  noiseSuppression: true,
                  autoGainControl: true,
              } 
          });
          
          // Force 16kHz sample rate for Whisper
          const AudioContext = window.AudioContext || window['webkitAudioContext'];
          audioContext = new AudioContext({ sampleRate: 16000 });
          
          audioInput = audioContext.createMediaStreamSource(mediaStream);
          
          // Use ScriptProcessor for capture (simple buffer collection)
          // Buffer size 4096 = ~0.25s latancy
          processor = audioContext.createScriptProcessor(4096, 1, 1);
          
          processor.onaudioprocess = (e) => {
              if (!isRecording) return;
              const inputData = e.inputBuffer.getChannelData(0);
              // Clone data because inputBuffer is reused
              audioChunks.push(new Float32Array(inputData));
          };
          
          audioInput.connect(processor);
          processor.connect(audioContext.destination);
          
          isRecording = true;
          statusMessage = '🎙️ Merekam... (Klik lagi untuk stop)';
          
      } catch (err) {
          console.error(err);
          statusMessage = '❌ Gagal akses mikrofon: ' + err.message;
      }
  }

  function stopAudioCapture() {
      if (processor && audioInput) {
          audioInput.disconnect();
          processor.disconnect();
      }
      if (mediaStream) {
          mediaStream.getTracks().forEach(track => track.stop());
      }
      if (audioContext) {
          audioContext.close();
      }
      
      processor = null;
      audioInput = null;
      mediaStream = null;
      audioContext = null;
  }

  async function stopRecording() {
      // Capture sample rate before closing context
      const currentSampleRate = audioContext ? audioContext.sampleRate : 16000;

      isRecording = false;
      stopAudioCapture();
      
      if (audioChunks.length === 0) {
          statusMessage = '❌ Audio kosong.';
          return;
      }
      
      statusMessage = 'Memproses audio...';
      
      // Flatten chunks into single Float32Array for worker
      const totalLength = audioChunks.reduce((acc, chunk) => acc + chunk.length, 0);
      let audioData = new Float32Array(totalLength);
      let offset = 0;
      for (const chunk of audioChunks) {
          audioData.set(chunk, offset);
          offset += chunk.length;
      }

      // Resample to 16000Hz using OfflineAudioContext
      if (currentSampleRate !== 16000) {
          console.log(`Resampling from ${currentSampleRate} to 16000Hz using OfflineAudioContext...`);
          audioData = await resampleTo16k(audioData, currentSampleRate);
      } else {
        // Even if sample rate is same, we might want to normalize
        // But usually we just proceed.
      }

      // Normalize Audio (Boost volume)
      console.log('Normalizing audio...');
      audioData = normalizeAudio(audioData);
      
      // Send to worker
      whisperWorker.postMessage({
          type: 'transcribe',
          audio: audioData
      });
  }

  async function resampleTo16k(audioData, origSampleRate) {
      if (origSampleRate === 16000) return audioData;
      
      try {
          // Use OfflineAudioContext for high-quality resampling
          const newLength = Math.round(audioData.length * 16000 / origSampleRate);
          const offlineCtx = new OfflineAudioContext(1, newLength, 16000);
          const buffer = offlineCtx.createBuffer(1, audioData.length, origSampleRate);
          buffer.copyToChannel(audioData, 0);
          
          const source = offlineCtx.createBufferSource();
          source.buffer = buffer;
          source.connect(offlineCtx.destination);
          source.start();
          
          const renderedBuffer = await offlineCtx.startRendering();
          return renderedBuffer.getChannelData(0);
      } catch (e) {
          console.error("Resampling failed, falling back to simple method", e);
          // Fallback if OfflineAudioContext fails (rare)
          // ... (simple linear interpolation fallback could go here, but let's just return original and hope)
          return audioData;
      }
  }

  function normalizeAudio(audioData) {
      let maxVal = 0;
      for (let i = 0; i < audioData.length; i++) {
          if (Math.abs(audioData[i]) > maxVal) {
              maxVal = Math.abs(audioData[i]);
          }
      }
      
      if (maxVal === 0) return audioData; // Avoid division by zero
      
      const multiplier = 0.95 / maxVal; // Boost to 95% max amplitude
      const newData = new Float32Array(audioData.length);
      
      for (let i = 0; i < newData.length; i++) {
          newData[i] = audioData[i] * multiplier;
      }
      
      return newData;
  }

  function toggleListening() {
    if (isRecording) {
        stopRecording();
    } else {
        if (!isModelReady) {
            if (!isModelLoading) {
                isModelLoading = true;
                pendingRecording = true;
                whisperWorker.postMessage({ type: 'load' });
            } else {
                statusMessage = '⏳ Sedang memuat model...';
            }
            return;
        }
        startRecording();
    }
  }

  function toggleMute() {
    isMuted = !isMuted;
    if (isMuted) window.speechSynthesis.cancel();
  }

  function toggleSettings() {
    showSettings = !showSettings;
  }
  
  function handleSuggestionClick(text) {
    inputText = text;
    handleSend();
  }

  function speak(text) {
    if (isMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    // Clean text
    const cleanText = text.replace(/[*#_]/g, ''); 
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'id-ID';
    if (selectedVoice) utterance.voice = selectedVoice;
    
    window.speechSynthesis.speak(utterance);
  }

  async function handleSend() {
    if (!inputText.trim()) return;

    const userMessage = inputText;
    messages = [...messages, { role: 'user', text: userMessage }];
    inputText = '';
    isLoading = true;

    scrollToBottom();

    try {
      const result = await sendMessage(userMessage, sessionId);
      if (result && result.reply) {
        messages = [...messages, { role: 'assistant', text: result.reply }];
        speak(result.reply);
      } else {
        messages = [...messages, { role: 'assistant', text: 'Maaf, saya belum mengerti.' }];
      }
    } catch (e) {
      console.error(e);
      messages = [...messages, { role: 'assistant', text: `Jaringan bermasalah: ${e.message || 'Tidak dapat terhubung ke server.'}` }];
    } finally {
      isLoading = false;
      scrollToBottom();
    }
  }

  function scrollToBottom() {
    setTimeout(() => {
      // ChatWindow exposes chatContainer binding
       if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 50);
  }

  function startNewChat() {
    // Reset state instead of reloading
    messages = [];
    inputText = '';
    initSession();
    // On mobile, keep sidebar open or close? Usually close if user selects action.
    if (window.innerWidth < 768) {
      isSidebarOpen = false;
    }
  }



  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
  }
</script>

<MainLayout>
  <!-- Responsive Sidebar -->
  <div slot="sidebar" class="h-full z-20 {isSidebarOpen ? (window.innerWidth < 768 ? 'fixed inset-y-0 left-0 block' : 'block') : 'hidden'}">
    <Sidebar 
      {isMuted} 
      {showSettings} 
      {voiceList}
      bind:selectedVoice 
      onNewChat={startNewChat}
      onToggleMute={toggleMute}
      onToggleSettings={toggleSettings}
      onToggleSidebar={toggleSidebar} 
    />
    
    <!-- Overlay for mobile -->
    {#if isSidebarOpen}
      <button 
        class="fixed inset-0 bg-black/50 z-10 md:hidden cursor-default w-full h-full border-none" 
        on:click={toggleSidebar}
        on:keydown={(e) => e.key === 'Escape' && toggleSidebar()}
        aria-label="Close Sidebar"
      ></button>
    {/if}
  </div>

  <div slot="header">
    <Header onToggleSidebar={toggleSidebar} {isSidebarOpen} />
    
    <!-- Dynamic Island Status -->
    {#if statusMessage}
    <div class="fixed left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in top-[env(safe-area-inset-top)] mt-6">
        <div class="bg-black/80 backdrop-blur-md text-white px-6 py-2 rounded-full shadow-2xl flex items-center gap-3 border border-white/10 min-w-[200px] justify-center transition-all duration-300">
           <!-- Spinner or Icon based on message -->
           {#if statusMessage.includes('memuat') || statusMessage.includes('Mengunduh')}
               <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
           {:else if statusMessage.includes('Merekam')}
               <div class="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
           {:else if statusMessage.includes('Menganalisis')}
               <div class="w-4 h-4 text-xs">✨</div>
           {/if}
           
           <span class="text-xs font-medium tracking-wide">{statusMessage}</span>
        </div>
    </div>
    {/if}
  </div>

  <div slot="chat-window" style="height: 100%;">
    <ChatWindow 
      {messages} 
      {isLoading} 
      bind:chatContainer
      onSuggestionClick={handleSuggestionClick}
    />
  </div>

  <div slot="input-area">
    <ChatInput 
      bind:value={inputText}
      {isLoading}
      {isListening}
      onSend={handleSend}
      onToggleListening={toggleListening}
    />
  </div>
</MainLayout>
