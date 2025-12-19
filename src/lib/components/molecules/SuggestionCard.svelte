<script>
  export let text = '';
  export let icon = '';
  export let mobilePill = false;
</script>

{#if mobilePill}
  <!-- Pill Style for Mobile -->
  <div 
    class="bg-gemini-sidebar hover:bg-[#333537] rounded-full px-5 py-2.5 flex items-center gap-3 cursor-pointer transition-colors w-fit border border-transparent active:border-gemini-border"
    on:click
    role="button"
    tabindex="0"
    on:keydown
  >
    <div class="text-lg">{icon}</div>
    <p class="m-0 text-[#e3e3e3] text-sm whitespace-nowrap">{text}</p>
  </div>
{:else}
  <!-- Card Style for Desktop -->
  <div 
    class="bg-gemini-sidebar p-[15px] rounded-xl w-[160px] md:w-[180px] h-[130px] md:h-[140px] shrink-0 flex flex-col justify-between cursor-pointer transition-colors hover:bg-[#333537]"
    on:click
    role="button"
    tabindex="0"
    on:keydown
  >
    <p class="m-0 text-[#e3e3e3] text-sm md:text-[15px]">{text}</p>
    <div class="self-end bg-gemini-bg p-2 rounded-full text-lg md:text-xl flex items-center justify-center w-8 h-8 md:w-10 md:h-10">{icon}</div>
  </div>
{/if}
