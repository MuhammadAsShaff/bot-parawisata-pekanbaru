<script>
  export let type = 'user'; // 'user' | 'assistant'
  export let label = 'U';
</script>

<div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 {type === 'user' ? 'bg-[#004a77] font-bold text-white text-sm' : 'bg-transparent'}">
  {#if type === 'assistant'}
    <img src="/sikantin-logo.svg" alt="SiPekan" class="w-[30px] h-[30px]">
  {:else}
    {label}
  {/if}
</div>
