<script>
  import Avatar from '../atoms/Avatar.svelte';

  export let role = 'user'; // 'user' | 'assistant'
  export let text = '';
  export let isTyping = false;
</script>

<div class="flex gap-[15px] max-w-full mb-5 {role === 'user' ? 'justify-end' : 'justify-start'}">
  {#if role === 'assistant'}
    <div class="shrink-0">
      <Avatar type="assistant" />
    </div>
  {/if}

  <div class="text-base leading-[1.6] max-w-[90%] md:max-w-[80%] break-words {role === 'user' ? 'bg-gemini-hover text-gemini-text rounded-[18px] rounded-br-[4px] p-[12px_18px]' : 'bg-transparent p-0 text-gemini-text w-full'} {isTyping ? 'italic text-[#8e918f] animate-pulse' : ''}">
    {#if role === 'user'}
      {text}
    {:else}
      {#if isTyping}
        Thinking...
      {:else}
        {@html text.replace(/\n/g, '<br>')}
      {/if}
    {/if}
  </div>
</div>
