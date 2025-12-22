<script>
  import { createEventDispatcher } from 'svelte';
  import Icon from '../atoms/Icon.svelte';
  import Button from '../atoms/Button.svelte';

  export let show = false;
  export let title = '';

  const dispatch = createEventDispatcher();

  function close() {
    dispatch('close');
  }

  function handleKeydown(e) {
    if (e.key === 'Escape' && show) {
      close();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown}/>

{#if show}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div 
      class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity cursor-default"
      on:click={close}
    ></div>

    <!-- Modal Content -->
    <div class="relative w-full max-w-lg bg-gemini-bg border border-white/10 rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 opacity-100 flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-gemini-sidebar/50">
        <h2 class="text-xl font-semibold text-gemini-text tracking-wide">{title}</h2>
        <Button variant="icon" on:click={close} className="!p-2 -mr-2">
          <Icon path="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </Button>
      </div>

      <!-- Body -->
      <div class="p-4 md:p-6 overflow-y-auto text-gemini-text-muted leading-relaxed">
        <slot></slot>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Optional: Add simple enter/exit transitions if needed for polish, but Svelte transition syntax is cleaner directly in template if we used it. 
     For now simple condition rendering is fine. */
</style>
