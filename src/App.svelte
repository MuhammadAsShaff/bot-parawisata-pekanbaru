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

  let isTyping = false;
  let isMuted = false;
  let showSettings = false;
  
  let chatContainer; // Bound to ChatWindow
  let textBeforeRecording = ''; // Context buffer for appending

  
  // Voice State
  let selectedVoice = null;
  let voiceList = [];
  let voiceRetryCount = 0;
  
  // Session State
  let sessionId = '';
  let chatHistory = [];
  let sessionExpiryTimer;

  // --- Methods ---

  const MAX_HISTORY = 50;

  function resetSessionTimer() {
      if (sessionExpiryTimer) clearTimeout(sessionExpiryTimer);
      sessionExpiryTimer = setTimeout(() => {
          // 1. Append message to CURRENT/OLD Session
          messages = [...messages, { role: 'assistant', text: '⚠️ Sesi chat telah berakhir (15 menit). Memulai sesi baru.' }];
          
          // 2. Save the OLD session with the notification
          updateCurrentSession();
          
          // 3. Start FRESH session (clean slate)
          initSession();
      }, 15 * 60 * 1000); 
  }

  function loadHistoryIndex() {
      try {
          const idx = localStorage.getItem('chat_index');
          return idx ? JSON.parse(idx) : [];
      } catch { return []; }
  }

  function saveHistoryIndex(index) {
      if (typeof localStorage !== 'undefined') {
          localStorage.setItem('chat_index', JSON.stringify(index));
      }
  }

  function saveSessionToStorage(id, msgs) {
      if (typeof localStorage !== 'undefined') {
          localStorage.setItem(`chat_session_${id}`, JSON.stringify(msgs));
      }
  }

  function loadSessionFromStorage(id) {
      try {
          const data = localStorage.getItem(`chat_session_${id}`);
          // Ensure loaded messages do not animate again by setting animate: false
          return data ? JSON.parse(data).map(m => ({ ...m, animate: false })) : [];
      } catch { return []; }
  }

  function deleteSessionFromStorage(id) {
      if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(`chat_session_${id}`);
      }
  }

  function updateCurrentSession() {
      // 1. Save Messages to specific key
      saveSessionToStorage(sessionId, messages);

      // 2. Update Index (Metadata only)
      const existingIdx = chatHistory.findIndex(c => c.id === sessionId);
      
      // Determine title
      let title = 'New Chat';
      const firstUserMsg = messages.find(m => m.role === 'user');
      if (firstUserMsg) {
           title = firstUserMsg.text.substring(0, 30) + (firstUserMsg.text.length > 30 ? '...' : '');
      } else if (existingIdx !== -1) {
           title = chatHistory[existingIdx].title || 'New Chat';
      }

      const meta = {
          id: sessionId,
          title: title,
          timestamp: Date.now()
      };

      let newHistory = [...chatHistory];
      if (existingIdx !== -1) {
          newHistory.splice(existingIdx, 1);
      }
      newHistory.unshift(meta);

      // 3. Prune if too large
      if (newHistory.length > MAX_HISTORY) {
          const toRemove = newHistory.pop();
          deleteSessionFromStorage(toRemove.id); // Clean up old data
      }

      chatHistory = newHistory;
      saveHistoryIndex(chatHistory);
  }

  function loadChat(id) {
      // Load messages from specific storage key
      const msgs = loadSessionFromStorage(id);
      sessionId = id;
      messages = msgs;
      
      if (window.innerWidth < 768) isSidebarOpen = false;
      
      // resetSessionTimer(); // Removed: Timer should not start on load
  }

  function initSession() {
    sessionId = 'sess-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    console.log('New Session ID:', sessionId);
    messages = [];
    // Don't save to history yet - wait for first message
    // resetSessionTimer(); // Removed: Timer should not start on init
  }

  function deleteChat(id) {
      deleteSessionFromStorage(id);
      chatHistory = chatHistory.filter(c => c.id !== id);
      saveHistoryIndex(chatHistory);
      
      // If we deleted the current session, start a new one
      if (sessionId === id) {
          initSession();
      }
  }

  function clearHistory() {
      // Clear all sessions from storage
      chatHistory.forEach(c => deleteSessionFromStorage(c.id));
      
      // Clear index
      chatHistory = [];
      saveHistoryIndex([]);
      
      // Reset current session
      initSession();
  }

  function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    
    let allVoices = window.speechSynthesis.getVoices();
    
    // Retry if voices are not yet loaded (Chrome/Android quirk)
    // Limit retries to avoid infinite loop
    if (allVoices.length === 0) {
        if (voiceRetryCount < 20) { // Retry for ~2 seconds
             voiceRetryCount++;
             setTimeout(loadVoices, 100);
             return;
        }
    } else {
        voiceRetryCount = 0;
    }

    // Helper to check if voice is Indonesian
    const isIndonesian = (v) => v.lang === 'id-ID' || v.lang === 'id_ID' || v.lang.toLowerCase().includes('indones');

    // Filter for Indonesian voices
    let indonesianVoices = allVoices.filter(isIndonesian);

    if (indonesianVoices.length > 0) {
        voiceList = indonesianVoices;
    } else {
        console.warn('No Indonesian voices found. Listing all available voices.');
        voiceList = allVoices; 
    }

    // If current selected voice is still in the new list, keep it.
    const currentStillExists = selectedVoice && voiceList.find(v => v.name === selectedVoice.name);

    if (!currentStillExists && voiceList.length > 0) {
        // Prioritize specific high-quality voices if available
        selectedVoice = voiceList.find(v => v.name === 'Google Bahasa Indonesia') || 
                        voiceList.find(v => v.name.includes('Indonesia')) ||
                        voiceList[0];
    }
  }

  let isSidebarOpen = true; // Default true for desktop

  let statusMessage = ''; // Debug status

  // --- Whisper WASM State ---
  // --- Web Speech API State ---
  let isRecording = false;
  let recognition = null;
  let isThinking = false;

  onMount(() => {
     if (window.innerWidth < 768) isSidebarOpen = false;

    // Load History with Migration Support
    const oldHistory = localStorage.getItem('chat_history');
    const index = localStorage.getItem('chat_index');

    if (oldHistory && !index) {
        // MIGRATION: Convert old monolithic history to new split format
        console.log('Migrating chat history...');
        try {
            const parsedOld = JSON.parse(oldHistory);
            const newIndex = [];
            
            // Process each session
            parsedOld.forEach(session => {
                // Save messages to separate key
                saveSessionToStorage(session.id, session.messages || []);
                
                // Add to index
                newIndex.push({
                    id: session.id,
                    title: session.title,
                    timestamp: session.timestamp
                });
            });
            
            chatHistory = newIndex;
            saveHistoryIndex(chatHistory);
            localStorage.removeItem('chat_history'); // Cleanup old blob
            
            if (chatHistory.length > 0) {
                loadChat(chatHistory[0].id);
            } else {
                initSession();
            }
        } catch (e) {
            console.error('Migration failed', e);
            initSession();
        }
    } else {
        // Normal Load
        chatHistory = loadHistoryIndex();
        if (chatHistory.length > 0) {
            loadChat(chatHistory[0].id);
        } else {
            initSession();
        }
    }
    loadVoices();
    if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = loadVoices;

    // Initialize Web Speech API
    // let textBeforeRecording = ''; // Moved to top level

    const SpeechRecognition = window['SpeechRecognition'] || window['webkitSpeechRecognition'];
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        // Standard single-shot mode is much more stable than continuous for V1
        recognition.continuous = false; 
        recognition.interimResults = true;

        recognition.onstart = () => {
             isRecording = true;
             statusMessage = '🎙️ Mendengarkan...';
        };

        recognition.onend = () => {
             console.log('Speech recognition ended.');
             isRecording = false;
             if (!isThinking && !isLoading) statusMessage = '';
        };

        recognition.onresult = (event) => {
            let interimAndFinal = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                interimAndFinal += event.results[i][0].transcript;
            }
            
            // In single-shot mode (continuous=false), we just update the input
            // textBeforeRecording is set when we START listening
            inputText = textBeforeRecording + interimAndFinal;
            
            // If final, we are essentially done in single-shot mode
            if (event.results[0].isFinal) {
                 statusMessage = '✅ Selesai.';
            }
        };

        recognition.onerror = (event) => {
             console.error('Speech Error:', event.error);
             isRecording = false;
             statusMessage = `❌ Error: ${event.error}`;
        };
    } else {
        console.warn('Web Speech API not supported in this browser.');
    }

    return () => {
        if (recognition) recognition.abort();
    };
  });


  function toggleListening() {
    if (!recognition) {
        alert('Browser Anda tidak mendukung fitur Voice Input (Web Speech API). Gunakan Chrome/Edge.');
        return;
    }

    if (isRecording) {
        recognition.stop();
        isRecording = false;
        statusMessage = ''; 
    } else {
        // Reset context
        if (!inputText || !inputText.trim()) {
            textBeforeRecording = '';
        } else {
            textBeforeRecording = inputText + (inputText.endsWith(' ') ? '' : ' ');
        }
        
        try {
            recognition.start();
            isRecording = true;
            statusMessage = '🎙️ Listening...';
        } catch (e) {
            console.error('Failed to start recording:', e);
            statusMessage = '❌ Gagal memulai.';
            isRecording = false; // rollback
        }
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

  // --- Audio Unlock for Mobile ---
  // Mobile browsers require a direct user interaction to "unlock" audio.
  let audioUnlocked = false;
  function unlockAudio() {
      if (audioUnlocked || !('speechSynthesis' in window)) return;
      
      // Create a silent utterance to unlock the queue
      const utterance = new SpeechSynthesisUtterance('');
      utterance.volume = 0; // Silent
      window.speechSynthesis.speak(utterance);
      audioUnlocked = true;
      console.log('Audio unlocked');
  }

  function speak(text, force = false) {
    if ((isMuted && !force) || !('speechSynthesis' in window)) return;
    
    // Safety: try to reload voices if missing (e.g. browser cleared them)
    if (voiceList.length === 0) loadVoices();

    // Unlock on first speak attempt if not yet done (though usually better on click)
    if (!audioUnlocked) unlockAudio();

    window.speechSynthesis.cancel();
    
    // Clean text
    const cleanText = text.replace(/[*#_]/g, ''); 
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'id-ID'; // Default hint
    
    if (selectedVoice) {
        utterance.voice = selectedVoice;
        // Ensure lang matches voice to avoid silent failures on some browsers
        utterance.lang = selectedVoice.lang; 
    }
    
    // Mobile quirk: sometimes utterance gets garbage collected if not held
    // window.currentUtterance = utterance; 
    
    utterance.onerror = (e) => console.error('Speech Error:', e);
    
    window.speechSynthesis.speak(utterance);
  }

  let chatInputComponent;

  async function handleSend() {
    if (!inputText.trim()) return;
    
    // Start/Reset 15-minute timer on interaction
    resetSessionTimer();
    if (isLoading) return;

    // Mobile: Unlock audio context immediately on interaction
    unlockAudio();

    const userMessage = inputText;
    messages = [...messages, { role: 'user', text: userMessage }];
    updateCurrentSession(); // Save user message immediately
    inputText = '';
    isLoading = true;
    
    // Keep focus on input
    setTimeout(() => chatInputComponent?.focusInput(), 0);

    scrollToBottom();

    try {
      const result = await sendMessage(userMessage, sessionId);
      if (result && result.reply) {
        messages = [...messages, { role: 'assistant', text: result.reply, animate: true }];
        speak(result.reply);
        isTyping = true;
      } else {
        messages = [...messages, { role: 'assistant', text: 'Maaf, saya belum mengerti.', animate: true }];
        isTyping = true;
      }
    } catch (e) {
      console.error(e);
      messages = [...messages, { role: 'assistant', text: `Jaringan bermasalah: ${e.message || 'Tidak dapat terhubung ke server.'}`, animate: true }];
      isTyping = true;
    } finally {
      updateCurrentSession(); // Save to history
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

  function handleAnimationComplete() {
    isTyping = false;
  }

  function handleStop() {
    const lastIdx = messages.length - 1;
    if (lastIdx >= 0 && messages[lastIdx].role === 'assistant') {
        const newMsgs = [...messages];
        // Stop animation for this message
        newMsgs[lastIdx] = { ...newMsgs[lastIdx], stopAnimation: true };
        messages = newMsgs;
    }
    isTyping = false;
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
      {chatHistory}
      currentSessionId={sessionId}
      onLoadChat={loadChat}
      onDeleteChat={deleteChat}
      onClearHistory={clearHistory}
      on:reloadVoices={loadVoices}
      on:testVoice={() => speak('Halo, ini adalah tes suara.', true)}
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
           {:else if statusMessage.includes('Merekam') || statusMessage.includes('Mendengarkan')}
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
      on:animationComplete={handleAnimationComplete}
    />
  </div>

  <div slot="input-area">
    <ChatInput 
      bind:this={chatInputComponent}
      bind:value={inputText}
      {isLoading}
      isListening={isRecording}
      {isTyping}
      onSend={handleSend}
      onToggleListening={toggleListening}
      onStop={handleStop}
    />
  </div>
</MainLayout>
