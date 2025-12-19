<script>
  export let variant = 'icon'; // 'icon' | 'primary' | 'ghost'
  export let title = '';
  export let disabled = false;
  export let active = false;
  export let className = '';
  
  // Tailwind Classes Map
  const baseClasses = 'border-none cursor-pointer flex items-center justify-center font-sans transition-colors';
  const variants = {
    icon: `bg-transparent text-[#e3e3e3] p-2.5 rounded-full hover:not-disabled:bg-[#333537] ${active ? 'bg-[rgba(255,138,128,0.2)]' : ''}`,
    ghost: 'bg-transparent text-[#e3e3e3] p-2.5 rounded-[20px] w-full justify-start gap-2.5 hover:bg-gemini-hover'
  };
</script>

<button 
  type="button"
  class="{baseClasses} {variants[variant]} {active ? 'active' : ''} {className} disabled:opacity-50 disabled:cursor-default" 
  {title} 
  {disabled} 
  on:click
>
  <slot />
</button>
