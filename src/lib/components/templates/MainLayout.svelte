<div class="flex h-screen w-full bg-gemini-bg text-gemini-text overflow-hidden relative">
  <div class="h-full">
    <slot name="sidebar" />
  </div>

  <main class="flex-1 flex flex-col relative bg-gemini-bg min-h-0">
    <div>
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
