<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import Avatar from '../atoms/Avatar.svelte';

  const dispatch = createEventDispatcher();

  export let role = 'user'; // 'user' | 'assistant'
  export let text = '';
  export let isTyping = false;
  export let animate = false;
  export let stopAnimation = false;

  let visibleText = '';
  let interval;
  let showCursor = false;

  function parseMarkdown(input) {
    if (!input) return '';
    
    // 1. Handle Bold (**text**)
    let processed = input.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 2. Handle Bullet Lists (* item)
    const lines = processed.split('\n');
    let output = '';
    let inList = false;
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('* ')) {
        if (!inList) {
          output += '<ul class="list-disc pl-6 my-2 space-y-1">';
          inList = true;
        }
        output += `<li>${trimmed.substring(2)}</li>`;
      } else {
        if (inList) {
          output += '</ul>';
          inList = false;
        }
        // Add <br> for newlines, but avoid extra breaks around lists if possible
        if (index > 0) output += '<br>';
        output += line;
      }
    });
    
    if (inList) output += '</ul>';
    
    return output;
  }

  // Handle animation
  onMount(() => {
    if (role === 'assistant' && animate) {
      if (stopAnimation) {
          visibleText = text;
          dispatch('animationComplete');
          return;
      }

      visibleText = '';
      showCursor = true;
      let i = 0;
      
      interval = setInterval(() => {
        if (i < text.length) {
          visibleText += text.charAt(i);
          i++;
        } else {
          endAnimation();
        }
      }, 5); // Adjust speed here (lower = faster)
    } else {
      visibleText = text;
      // Dispatch complete only if it was supposed to be animated but skipped or finished
      if (role === 'assistant') dispatch('animationComplete');
    }
  });

  function endAnimation() {
      if (interval) clearInterval(interval);
      interval = null;
      showCursor = false;
      dispatch('animationComplete');
  }

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });

  // Watch stopAnimation
  $: if (stopAnimation && interval) {
      visibleText = text;
      endAnimation();
  }

  // If text updates dynamically (not expected but safe to handle) or animation is disabled
  $: if (!animate && role === 'assistant') {
      visibleText = text;
  }
  
  // For user messages, always show full text
  $: if (role === 'user') {
      visibleText = text;
  }

  $: formattedText = parseMarkdown(visibleText);
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
        {@html formattedText}
        {#if showCursor}
          <span class="inline-block w-2 h-4 bg-gemini-text ml-1 align-middle animate-pulse"></span>
        {/if}
      {/if}
    {/if}
  </div>
</div>
