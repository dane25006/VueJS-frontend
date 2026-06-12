<script setup>
import { computed } from 'vue'

const props = defineProps({
  stock: { type: [Number, String], default: 0 },
})

const value = computed(() => Number(props.stock) || 0)

// 5-tick gauge. Thresholds chosen so the bar reads as a quick "reorder" signal.
const thresholds = [1, 5, 15, 40, 100]

const filled = computed(() => {
  return thresholds.filter((t) => value.value >= t).length
})

const tone = computed(() => {
  if (value.value === 0) return 'bg-rust'
  if (value.value < 5) return 'bg-amber'
  return 'bg-sage'
})

const label = computed(() => {
  if (value.value === 0) return 'Out of stock'
  if (value.value < 5) return 'Low stock'
  return 'In stock'
})
</script>

<template>
  <div class="flex items-center gap-2" :title="`${label} — ${value} units`">
    <div class="flex items-end gap-[2px] h-4">
      <span
        v-for="i in 5"
        :key="i"
        class="w-1 rounded-sm transition-colors"
        :class="[
          i <= Math.max(filled, value > 0 ? 1 : 0) ? tone : 'bg-ink-border',
        ]"
        :style="{ height: `${30 + i * 14}%` }"
      />
    </div>
    <span class="font-mono text-xs text-muted tabular-nums">{{ value }}</span>
  </div>
</template>
