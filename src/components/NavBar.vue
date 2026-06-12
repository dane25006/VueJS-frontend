<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { Package, Menu, X } from 'lucide-vue-next'

const route = useRoute()
const open = ref(false)

const links = [
  { label: 'Home', to: '/', match: 'home' },
  { label: 'Categories', to: '/categories', match: 'categories' },
  { label: 'Products', to: '/products', match: 'products' },
]

function isActive(match) {
  if (match === 'home') return route.name === 'home'
  return route.name?.startsWith(match)
}
</script>

<template>
  <header class="border-b border-ink-border bg-ink/90 backdrop-blur sticky top-0 z-20">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between h-16">
        <router-link to="/" class="flex items-center gap-2 group">
          <span class="grid place-items-center w-9 h-9 rounded-md bg-amber/10 text-amber border border-amber/30 group-hover:bg-amber/20 transition-colors">
            <Package :size="18" :stroke-width="2.25" />
          </span>
          <span class="font-display font-semibold text-lg tracking-wide text-paper">
            STOCKROOM
          </span>
        </router-link>

        <nav class="hidden md:flex items-center gap-1">
          <router-link
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="relative px-4 py-2 font-display text-sm tracking-wide transition-colors"
            :class="isActive(link.match) ? 'text-amber' : 'text-muted hover:text-paper'"
          >
            <span class="font-mono text-xs mr-1.5 text-muted/70"></span>
            {{ link.label }}
            <span
              v-if="isActive(link.match)"
              class="absolute left-3 right-3 -bottom-px h-px bg-amber"
            />
          </router-link>
        </nav>

        <button
          class="md:hidden p-2 text-paper"
          @click="open = !open"
          :aria-expanded="open"
          aria-label="Toggle navigation"
        >
          <Menu v-if="!open" :size="22" />
          <X v-else :size="22" />
        </button>
      </div>

      <nav v-if="open" class="md:hidden flex flex-col pb-4 gap-1 border-t border-ink-border pt-2">
        <router-link
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="px-2 py-2 rounded font-display text-sm tracking-wide"
          :class="isActive(link.match) ? 'text-amber bg-ink-raised' : 'text-muted hover:text-paper hover:bg-ink-raised'"
          @click="open = false"
        >
          <span class="font-mono text-xs mr-1.5 text-muted/70">{{ link.no }}</span>
          {{ link.label }}
        </router-link>
      </nav>
    </div>
  </header>
</template>
