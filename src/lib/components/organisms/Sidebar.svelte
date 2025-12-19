<script>
  import Button from '../atoms/Button.svelte';
  import Icon from '../atoms/Icon.svelte';

  export let onNewChat;
  export let onToggleMute;
  export let onToggleSettings;
  export let isMuted = false;
  export let showSettings = false;
  export let selectedVoice = null;
  export let voiceList = [];
  export let onToggleSidebar;
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

  <div class="mt-auto flex flex-col gap-1.5">
    <Button variant="ghost" on:click={onToggleMute}>
      <span class="text-sm">{isMuted ? '🔇 Unmute Voice' : '🔊 Mute Voice'}</span>
    </Button>
    <Button variant="ghost" on:click={onToggleSettings}>
      <span class="text-sm">⚙️ Settings</span>
    </Button>
    
    {#if showSettings}
      <div class="p-2.5 bg-gemini-hover rounded-[10px]">
        <label for="voice-select" class="block text-xs mb-1 text-gemini-text-muted">Voice:</label>
        <select id="voice-select" bind:value={selectedVoice} class="w-full bg-gemini-bg text-gemini-text border-none p-2 rounded-[5px] text-sm focus:outline-none focus:ring-1 focus:ring-gemini-text-muted">
          {#each voiceList as voice}
            <option value={voice}>{voice.name}</option>
          {/each}
        </select>
      </div>
    {/if}
  </div>
</aside>
