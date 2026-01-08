<script>
  import { createEventDispatcher } from 'svelte';
  import Button from '../atoms/Button.svelte';
  import Icon from '../atoms/Icon.svelte';

  const dispatch = createEventDispatcher();

  export let onNewChat;
  export let onToggleMute;
  export let onToggleSettings;
  export let isMuted = false;
  export let showSettings = false;
  export let selectedVoice = null;
  export let voiceList = [];
  export let onToggleSidebar;
  export let chatHistory = [];
  export let currentSessionId = '';
  export let onLoadChat = (id) => {};
  export let onDeleteChat = (id) => {};
  export let onClearHistory = () => {};
  
  let activeMenuId = null;

  function toggleMenu(id, event) {
      // Toggle logic handled by if block, here we just set it
      if (activeMenuId === id) {
          activeMenuId = null;
      } else {
          activeMenuId = id;
      }
  }
</script>

<aside class="w-[260px] bg-gemini-sidebar flex flex-col p-[20px_10px] pb-20 md:pb-[20px] gap-5 h-full box-border shrink-0 shadow-xl md:shadow-none transition-all duration-300 overflow-y-auto scrollbar-custom z-30 relative">
  <div class="pl-2.5">
    <Button variant="icon" title="Menu" on:click={onToggleSidebar}>
      <Icon path="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
    </Button>
  </div>
  
  <div role="button" tabindex="0" class="bg-gemini-bg rounded-[20px] px-4 py-2.5 flex items-center gap-2.5 cursor-pointer text-gemini-text-muted hover:bg-gemini-hover hover:text-gemini-text transition-colors w-fit" on:click={onNewChat} on:keydown>
    <span class="text-xl">+</span>
    <span class="text-sm font-medium">New chat</span>
  </div>

  <div class="flex-1 overflow-y-auto flex flex-col gap-1 mt-2 pb-2" on:mouseleave={() => activeMenuId = null}>
    {#if chatHistory.length > 0}
      <div class="px-4 py-2 text-xs font-medium text-gemini-text-muted">Recent</div>
      {#each chatHistory as chat}
        <div class="group relative flex items-center pr-2 rounded-[20px] transition-colors {currentSessionId === chat.id ? 'bg-gemini-hover' : 'hover:bg-gemini-hover'}">
            <button 
              class="flex-1 text-left px-4 py-2 text-sm truncate bg-transparent border-none cursor-pointer {currentSessionId === chat.id ? 'text-gemini-text' : 'text-gemini-text-muted group-hover:text-gemini-text'}"
              on:click={() => onLoadChat(chat.id)}
            >
              {chat.title || 'New Chat'}
            </button>
            
            <!-- 3 Dots Menu Trigger -->
            <button 
                class="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-full hover:bg-white/10 text-gemini-text-muted transition-all"
                on:click|stopPropagation={(e) => toggleMenu(chat.id, e)}
                title="Options"
            >
                <Icon path="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" size="16" />
            </button>

            <!-- Dropdown Menu -->
            {#if activeMenuId === chat.id}
                <div class="absolute right-0 top-8 w-32 bg-[#2e2e2e] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden py-1">
                    <button 
                        class="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2"
                        on:click|stopPropagation={() => { onDeleteChat(chat.id); activeMenuId = null; }}
                    >
                        <Icon path="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" size="14" />
                        Delete
                    </button>
                </div>
                <!-- Backdrop to close -->
                <div class="fixed inset-0 z-40" on:click|stopPropagation={() => activeMenuId = null}></div>
            {/if}
        </div>
      {/each}
    {/if}
  </div>

  <div class="mt-auto flex flex-col gap-1.5">
    <Button variant="ghost" on:click={onClearHistory}>
      <span class="text-sm text-red-400">🗑️ Clear All History</span>
    </Button>
    <Button variant="ghost" on:click={onToggleMute}>
      <span class="text-sm">{isMuted ? '🔇 Unmute Voice' : '🔊 Mute Voice'}</span>
    </Button>
    <Button variant="ghost" on:click={onToggleSettings}>
      <span class="text-sm">⚙️ Settings</span>
    </Button>
    
    {#if showSettings}
      <div class="p-2.5 bg-gemini-hover rounded-[10px] flex flex-col gap-2">
        <div>
            <label for="voice-select" class="block text-xs mb-1 text-gemini-text-muted">Voice:</label>
            <div class="flex gap-1">
                <select id="voice-select" bind:value={selectedVoice} class="flex-1 bg-gemini-bg text-gemini-text border-none p-2 rounded-[5px] text-sm focus:outline-none focus:ring-1 focus:ring-gemini-text-muted min-w-0">
                {#if voiceList.length === 0}
                    <option value={null}>Loading voices...</option>
                {:else}
                    {#each voiceList as voice}
                    <option value={voice}>{voice.name}</option>
                    {/each}
                {/if}
                </select>
                <!-- Refresh Button -->
                <button class="p-2 bg-gemini-bg rounded-[5px] text-gemini-text hover:bg-white/10" on:click={() => dispatch('reloadVoices')} title="Refresh Voice List">
                    <Icon path="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" size="14" />
                </button>
            </div>
        </div>
        
        <button class="w-full py-1.5 bg-gemini-bg rounded-[5px] text-xs font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2" on:click={() => dispatch('testVoice')}>
            <span>🔊 Test Voice</span>
        </button>
      </div>
    {/if}
  </div>
</aside>
