<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Tags, Boxes, AlertTriangle, CircleCheck, ArrowRight, PlusCircle } from 'lucide-vue-next'
import categoriesApi from '../api/categories'
import productsApi from '../api/products'
import StockGauge from '../components/StockGauge.vue'

const categories = ref([])
const products = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const [catRes, prodRes] = await Promise.all([categoriesApi.list(), productsApi.list()])
    categories.value = catRes.data.data ?? catRes.data
    products.value = prodRes.data.data ?? prodRes.data
  } catch (e) {
    error.value = 'Could not reach the inventory API. Check that the backend is running and CORS is configured.'
  } finally {
    loading.value = false
  }
})

const stats = computed(() => {
  const activeProducts = products.value.filter((p) => p.is_active).length
  const totalValue = products.value.reduce((sum, p) => sum + Number(p.price || 0) * Number(p.stock || 0), 0)
  const lowStock = products.value.filter((p) => Number(p.stock || 0) < 5)
  return {
    categoryCount: categories.value.length,
    productCount: products.value.length,
    activeProducts,
    totalValue,
    lowStock,
  }
})

const recentProducts = computed(() => [...products.value].slice(-5).reverse())

function currency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n) || 0)
}
</script>

<template>
  <div class="space-y-10">
    <!-- Hero -->
    <section class="border border-ink-border rounded-xl bg-ink-surface px-6 py-8 sm:px-10 sm:py-12">
      <p class="font-mono text-xs uppercase tracking-widest2 text-amber mb-3">Overview</p>
      <h1 class="font-display text-3xl sm:text-4xl font-semibold text-paper leading-tight">
        The full count of what's<br class="hidden sm:block" /> on the shelf, right now.
      </h1>
      <p class="text-muted mt-3 max-w-xl">
        A running ledger of every category and product in the catalog — stock levels,
        pricing, and status, kept in one place.
      </p>
      <div class="flex flex-wrap gap-3 mt-6">
        <RouterLink
          to="/products/new"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-amber text-ink font-display font-semibold text-sm hover:bg-amber-dim transition-colors"
        >
          <PlusCircle :size="16" /> Add a product
        </RouterLink>
        <RouterLink
          to="/categories/new"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-ink-border text-paper font-display font-semibold text-sm hover:bg-ink-raised transition-colors"
        >
          <PlusCircle :size="16" /> Add a category
        </RouterLink>
      </div>
    </section>

    <p v-if="error" class="text-rust text-sm">{{ error }}</p>

    <!-- Stats ledger -->
    <section class="grid grid-cols-2 sm:grid-cols-4 gap-px bg-ink-border rounded-xl overflow-hidden border border-ink-border">
      <div class="bg-ink-surface p-5">
        <p class="font-mono text-xs uppercase tracking-widest2 text-muted mb-2">01 · Categories</p>
        <p class="font-display text-3xl font-semibold text-paper">{{ loading ? '—' : stats.categoryCount }}</p>
      </div>
      <div class="bg-ink-surface p-5">
        <p class="font-mono text-xs uppercase tracking-widest2 text-muted mb-2">02 · Products</p>
        <p class="font-display text-3xl font-semibold text-paper">{{ loading ? '—' : stats.productCount }}</p>
      </div>
      <div class="bg-ink-surface p-5">
        <p class="font-mono text-xs uppercase tracking-widest2 text-muted mb-2">03 · Active</p>
        <p class="font-display text-3xl font-semibold text-sage">{{ loading ? '—' : stats.activeProducts }}</p>
      </div>
      <div class="bg-ink-surface p-5">
        <p class="font-mono text-xs uppercase tracking-widest2 text-muted mb-2">04 · Stock value</p>
        <p class="font-display text-3xl font-semibold text-amber">{{ loading ? '—' : currency(stats.totalValue) }}</p>
      </div>
    </section>

    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Low stock -->
      <section class="border border-ink-border rounded-xl bg-ink-surface p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-display font-semibold text-paper flex items-center gap-2">
            <AlertTriangle :size="16" class="text-amber" /> Needs reordering
          </h2>
          <RouterLink to="/products" class="text-xs font-mono text-muted hover:text-amber flex items-center gap-1">
            All products <ArrowRight :size="12" />
          </RouterLink>
        </div>

        <p v-if="loading" class="text-sm text-muted">Loading…</p>
        <p v-else-if="stats.lowStock.length === 0" class="text-sm text-muted flex items-center gap-2">
          <CircleCheck :size="14" class="text-sage" /> Everything is well stocked.
        </p>
        <ul v-else class="divide-y divide-ink-border">
          <li v-for="p in stats.lowStock" :key="p.id" class="py-2.5 flex items-center justify-between gap-3">
            <RouterLink :to="`/products/${p.id}`" class="text-sm text-paper hover:text-amber truncate">
              {{ p.name }}
            </RouterLink>
            <StockGauge :stock="p.stock" />
          </li>
        </ul>
      </section>

      <!-- Recently added -->
      <section class="border border-ink-border rounded-xl bg-ink-surface p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-display font-semibold text-paper flex items-center gap-2">
            <Boxes :size="16" class="text-amber" /> Latest entries
          </h2>
          <RouterLink to="/products" class="text-xs font-mono text-muted hover:text-amber flex items-center gap-1">
            All products <ArrowRight :size="12" />
          </RouterLink>
        </div>

        <p v-if="loading" class="text-sm text-muted">Loading…</p>
        <p v-else-if="recentProducts.length === 0" class="text-sm text-muted">No products yet — add the first one.</p>
        <ul v-else class="divide-y divide-ink-border">
          <li v-for="p in recentProducts" :key="p.id" class="py-2.5 flex items-center justify-between gap-3">
            <RouterLink :to="`/products/${p.id}`" class="text-sm text-paper hover:text-amber truncate">
              {{ p.name }}
            </RouterLink>
            <span class="font-mono text-xs text-muted">{{ currency(p.price) }}</span>
          </li>
        </ul>
      </section>
    </div>

    <!-- Categories strip -->
    <section class="border border-ink-border rounded-xl bg-ink-surface p-5">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-display font-semibold text-paper flex items-center gap-2">
          <Tags :size="16" class="text-amber" /> Categories
        </h2>
        <RouterLink to="/categories" class="text-xs font-mono text-muted hover:text-amber flex items-center gap-1">
          Manage <ArrowRight :size="12" />
        </RouterLink>
      </div>
      <p v-if="loading" class="text-sm text-muted">Loading…</p>
      <p v-else-if="categories.length === 0" class="text-sm text-muted">No categories yet — add the first one.</p>
      <div v-else class="flex flex-wrap gap-2">
        <RouterLink
          v-for="c in categories"
          :key="c.id"
          :to="`/categories/${c.id}`"
          class="px-3 py-1.5 rounded-full border border-ink-border text-sm text-paper hover:border-amber hover:text-amber transition-colors"
        >
          {{ c.name }}
        </RouterLink>
      </div>
    </section>
  </div>
</template>
