<script>
  import Avatar from '../atoms/Avatar.svelte';
  import Button from '../atoms/Button.svelte';
  import Icon from '../atoms/Icon.svelte';

  export let onToggleSidebar; 
  export let isSidebarOpen = false;
</script>

<header class="flex justify-between items-center p-3 md:p-5">
  <div class="text-lg md:text-[22px] text-gemini-text flex items-center gap-2">
    <!-- Menu Toggle: Visible on mobile, OR on desktop if sidebar is CLOSED -->
    <div class="{isSidebarOpen ? 'md:hidden' : 'block'}">
      <Button variant="icon" on:click={onToggleSidebar}>
        <Icon path="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
      </Button>
    </div>
    
    SiKantin PCR <span class="text-xs bg-gemini-hover px-2 py-0.5 rounded-md text-gemini-text">Beta</span>
  </div>
  <div class="user-profile">
    <Avatar type="user" label="U" />
  </div>
</header>
