<div class="flex h-[100dvh] w-full bg-gemini-bg text-gemini-text overflow-hidden relative">
  <div class="h-full pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]">
    <slot name="sidebar" />
  </div>

  <main class="flex-1 flex flex-col relative bg-gemini-bg min-h-0 pb-[env(safe-area-inset-bottom)] pr-[env(safe-area-inset-right)]">
    <div class="pt-[env(safe-area-inset-top)]">
        <slot name="header" />
    </div>

    <div class="flex-1 overflow-hidden flex flex-col min-h-0">
        <slot name="chat-window" />
    </div>

    <div>
        <slot name="input-area" />
    </div>
  </main>
</div>
