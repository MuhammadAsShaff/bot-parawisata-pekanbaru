<script>
  export let size = '24px';
  export let color = 'currentColor';
  export let viewBox = '0 0 24 24';
  
  // Example path for default, but mostly used via slot or path prop
  export let path = ''; 
</script>

<svg 
  {viewBox} 
  width={size} 
  height={size} 
  style="fill: {color}; width: {size}; height: {size};" 
  class={$$props.class}
  on:click
>
  {#if path}
    <path d={path}/>
  {:else}
    <slot />
  {/if}
</svg>
