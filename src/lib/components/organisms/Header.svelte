<script>
  import Avatar from '../atoms/Avatar.svelte';
  import Button from '../atoms/Button.svelte';
  import Icon from '../atoms/Icon.svelte';
  import Modal from '../molecules/Modal.svelte';

  export let onToggleSidebar; 
  export let isSidebarOpen = false;

  let showAboutModal = false;
</script>

<header class="flex justify-between items-center p-3 md:p-5">
  <div class="text-lg md:text-[22px] text-gemini-text flex items-center gap-2">
    <!-- Menu Toggle: Visible on mobile, OR on desktop if sidebar is CLOSED -->
    <div class="{isSidebarOpen ? 'md:hidden' : 'block'}">
      <Button variant="icon" on:click={onToggleSidebar}>
        <Icon path="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
      </Button>
    </div>
    
    SiPekan <span class="text-xs bg-gemini-hover px-2 py-0.5 rounded-md text-gemini-text">Beta</span>
  </div>
  
  <!-- User Profile / About Trigger -->
  <button 
    class="user-profile outline-none rounded-full transition-transform active:scale-95 focus:ring-2 focus:ring-white/20"
    on:click={() => showAboutModal = true}
    aria-label="About Project"
  >
    <Avatar type="user" label="U" />
  </button>
</header>

<Modal bind:show={showAboutModal} title="Tentang Project" on:close={() => showAboutModal = false}>
  <div class="space-y-6">
    <!-- Project Info -->
    <div>
      <h3 class="text-white text-lg font-medium mb-2">SiPekan</h3>
      <p>
        Project ini adalah asisten virtual berbasis AI yang dirancang untuk memudahkan wisatawan mencari informasi seputar pariwisata di Pekanbaru.
      </p>
    </div>

    <!-- Team Info -->
    <div>
      <h3 class="text-white text-lg font-medium mb-3">Credits</h3>
      
      <!-- Muhammad As Shaff -->
      <div class="group relative overflow-hidden bg-gradient-to-br from-gemini-hover/80 to-gemini-hover/30 p-4 rounded-2xl border border-white/10 flex items-center gap-4 transition-all hover:border-white/20 hover:shadow-lg">
        <!-- Shine effect -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-200%] group-hover:animate-shine"></div>
        
        <div class="w-14 h-14 shrink-0 rounded-full bg-gradient-to-br from-blue-500 via-cyan-400 to-teal-300 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-white/10">
          M
        </div>
        
        <div class="flex-1 min-w-0 z-10">
          <h4 class="text-white font-semibold text-lg leading-tight">Muhammad As Shaff</h4>
          <p class="text-blue-200 text-sm mt-0.5">Creator & Fullstack Developer</p>
        </div>
      </div>
    </div>

    <!-- Github Link -->
    <div>
      <h3 class="text-white text-lg font-medium mb-2">Repository</h3>
      <a 
        href="https://github.com/MuhammadAsShaff/bot-parawisata-pekanbaru.git" 
        target="_blank" 
        rel="noopener noreferrer"
        class="flex items-center gap-3 p-3.5 bg-gemini-sidebar hover:bg-gemini-hover border border-white/5 rounded-xl transition-all group active:scale-[0.98]"
      >
        <div class="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
          <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="flex-1 min-w-0 text-left">
           <div class="text-sm text-gemini-text-muted">GitHub</div>
           <div class="text-blue-400 group-hover:underline font-medium truncate">bot-parawisata-pekanbaru</div>
        </div>
        <Icon path="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" className="text-gemini-text-muted/50 w-5 h-5 shrink-0" />
      </a>
    </div>
  </div>
</Modal>
