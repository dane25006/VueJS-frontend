<script setup>
import { Trash2 } from 'lucide-vue-next'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Remove entry' },
  message: { type: String, default: 'This action cannot be undone.' },
  busy: { type: Boolean, default: false },
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 grid place-items-center bg-ink/70 px-4" @keydown.esc="emit('cancel')">
    <div class="w-full max-w-sm rounded-lg border border-ink-border bg-ink-surface p-5 shadow-xl">
      <div class="flex items-center gap-3 mb-3">
        <span class="grid place-items-center w-9 h-9 rounded-md bg-rust/10 text-rust border border-rust/30">
          <Trash2 :size="16" />
        </span>
        <h2 class="font-display font-semibold text-paper">{{ title }}</h2>
      </div>
      <p class="text-sm text-muted mb-5">{{ message }}</p>
      <div class="flex justify-end gap-2">
        <button
          class="px-3 py-1.5 rounded-md text-sm font-medium text-muted hover:text-paper hover:bg-ink-raised transition-colors"
          @click="emit('cancel')"
          :disabled="busy"
        >
          Cancel
        </button>
        <button
          class="px-3 py-1.5 rounded-md text-sm font-medium bg-rust/10 text-rust border border-rust/30 hover:bg-rust/20 transition-colors disabled:opacity-50"
          @click="emit('confirm')"
          :disabled="busy"
        >
          {{ busy ? 'Removing…' : 'Remove' }}
        </button>
      </div>
    </div>
  </div>
</template>
