<script>
  import Button from '../atoms/Button.svelte';
  import Icon from '../atoms/Icon.svelte';

  export let value = '';
  export let isLoading = false;
  export let isListening = false;
  export let onSend;
  export let onToggleListening;

  function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }
</script>

<div class="max-w-[900px] w-full mx-auto p-[0_10px_10px] md:p-[0_20px_20px] box-border bg-gemini-bg z-10 max-w-full overflow-hidden">
  <div class="bg-gemini-sidebar rounded-[28px] md:rounded-full flex items-center p-[8px_10px] md:p-[10px_15px] transition-colors focus-within:bg-gemini-hover">
    <div class="hidden md:flex items-center gap-1.5">
       <Button variant="icon" title="Add image">
         <Icon path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
       </Button>
    </div>
    
    <!-- Mobile Image Button (Inside input area logic, maybe simpler for now just hidden on small) -->
    <div class="md:hidden flex items-center">
       <Button variant="icon" title="Add image" className="!p-1.5">
         <Icon size="20px" path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
       </Button>
    </div>
    
    <input 
      type="text" 
      placeholder="Enter a prompt here" 
      class="flex-1 bg-transparent border-none text-gemini-text text-sm md:text-base p-2 md:p-2.5 outline-none placeholder:text-gemini-text-muted min-w-0"
      bind:value
      on:keydown={handleKeydown}
      disabled={isLoading}
    />

    <div class="flex items-center gap-0.5 md:gap-1.5">
      <Button 
        variant="icon" 
        active={isListening} 
        on:click={onToggleListening} 
        title="Voice Input"
        className="!p-1.5 md:!p-2.5 {isListening ? 'mic-active' : ''}"
      >
        {#if isListening}
           <!-- Active Mic Icon (Blue) -->
           <Icon path="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zM17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        {:else}
           <!-- Default Mic Icon -->
           <Icon path="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zM17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        {/if}
      </Button>

      {#if value.trim()}
         <Button variant="icon" className="!text-[#2ed573] !p-1.5 md:!p-2.5" on:click={onSend}>
             <Icon path="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
         </Button>
      {/if}
    </div>
  </div>
  <div class="text-center text-[10px] md:text-[11px] text-gemini-text-muted mt-2 md:mt-2.5">
    &copy; Kelompok Wortel
  </div>
</div>
