<script>
  import MessageBubble from '../molecules/MessageBubble.svelte';
  import SuggestionCard from '../molecules/SuggestionCard.svelte';
  import Avatar from '../atoms/Avatar.svelte';

  export let messages = [];
  export let isLoading = false;
  
  export let onSuggestionClick; 
  
  // Need to bind this for scrolling
  export let chatContainer; 
</script>

<div class="flex-1 overflow-y-auto flex flex-col px-4 md:px-5 max-w-[900px] w-full mx-auto box-border h-full scrollbar-custom" bind:this={chatContainer}>
  {#if messages.length === 0}
    <div class="flex-1 flex flex-col justify-center items-start pb-5 w-full">
      <!-- Mobile Greeting -->
      <div class="mb-6 w-full md:hidden">
        <h1 class="text-xl text-gemini-text-muted font-medium mb-1">Hi, Sobat Wisata</h1>
        <h2 class="text-4xl text-gemini-text font-medium leading-tight">Mau wisata ke mana?</h2>
      </div>

      <!-- Desktop Greeting -->
      <div class="hidden md:block mb-12 w-full pr-2 break-words overflow-hidden">
        <h1 class="text-[56px] m-0 leading-tight bg-gradient-to-r from-gemini-blue via-gemini-purple to-gemini-red bg-clip-text text-transparent font-medium break-all sm:break-words w-full">Halo, Sobat Wisata</h1>
        <h2 class="text-[56px] m-0 leading-tight text-[#444746] font-medium mt-0 break-all sm:break-words w-full">Mau wisata ke mana hari ini?</h2>
      </div>

      <!-- Mobile Suggestions (Vertical Pills) -->
      <div class="flex flex-col items-start gap-3 w-full md:hidden">
        <SuggestionCard 
          mobilePill={true}
          text="Rekomendasi wisata" 
          icon="🗺️" 
          on:click={() => onSuggestionClick('Rekomendasi tempat wisata menarik di Pekanbaru')}
        />
        <SuggestionCard 
          mobilePill={true}
          text="Event Pekanbaru" 
          icon="🎉" 
          on:click={() => onSuggestionClick('Info event menarik di Pekanbaru')}
        />
        <SuggestionCard 
          mobilePill={true}
          text="Kuliner Khas" 
          icon="🍜" 
          on:click={() => onSuggestionClick('Rekomendasi kuliner khas Pekanbaru')}
        />
        <SuggestionCard 
          mobilePill={true}
          text="Hotel terdekat" 
          icon="🏨" 
          on:click={() => onSuggestionClick('Rekomendasi hotel terdekat')}
        />
      </div>

      <!-- Desktop Suggestions (Horizontal Cards) -->
      <div class="hidden md:flex gap-[15px] overflow-x-auto w-full pb-2 snap-x snap-mandatory hide-scrollbar pr-5">
        <SuggestionCard 
          text="Rekomendasi tempat wisata menarik di Pekanbaru" 
          icon="🗺️" 
          on:click={() => onSuggestionClick('Rekomendasi tempat wisata menarik di Pekanbaru')}
        />
        <SuggestionCard 
          text="Info event menarik di Pekanbaru" 
          icon="🎉" 
          on:click={() => onSuggestionClick('Info event menarik di Pekanbaru')}
        />
        <SuggestionCard 
          text="Rekomendasi kuliner khas Pekanbaru" 
          icon="🍜" 
          on:click={() => onSuggestionClick('Rekomendasi kuliner khas Pekanbaru')}
        />
      </div>
    </div>
  {:else}
    <div class="flex flex-col gap-5 pb-20 md:pb-5 mt-5">
      {#each messages as msg}
        <MessageBubble 
          role={msg.role} 
          text={msg.text} 
          animate={msg.animate} 
          stopAnimation={msg.stopAnimation}
          on:animationComplete 
        />
      {/each}
      {#if isLoading}
         <MessageBubble role="assistant" isTyping={true} />
      {/if}
    </div>
  {/if}
</div>

<style>
  /* Tailwind doesn't support standard scrollbar styling yet without plugins */
  .scrollbar-custom {
    scrollbar-width: thin;
    scrollbar-color: #444746 transparent;
  }
  
  .hide-scrollbar {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
</style>
