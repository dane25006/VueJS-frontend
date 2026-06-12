<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink, useRouter } from 'vue-router'
import { ArrowLeft, Pencil, Trash2, Package } from 'lucide-vue-next'
import categoriesApi from '../api/categories'
import StockGauge from '../components/StockGauge.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()

const category = ref(null)
const loading = ref(true)
const error = ref('')
const confirmingDelete = ref(false)
const deleting = ref(false)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await categoriesApi.get(route.params.id)
    category.value = res.data.data ?? res.data
  } catch (e) {
    error.value = 'Could not load this category.'
  } finally {
    loading.value = false
  }
}

onMounted(load)

async function confirmDelete() {
  deleting.value = true
  try {
    await categoriesApi.remove(route.params.id)
    router.push('/categories')
  } catch (e) {
    error.value = 'Could not remove this category.'
    confirmingDelete.value = false
  } finally {
    deleting.value = false
  }
}

function currency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n) || 0)
}
</script>

<template>
  <div class="space-y-6">
    <RouterLink to="/categories" class="inline-flex items-center gap-1.5 text-sm text-muted hover:text-paper">
      <ArrowLeft :size="14" /> Back to categories
    </RouterLink>

    <p v-if="error" class="text-rust text-sm">{{ error }}</p>
    <p v-else-if="loading" class="text-sm text-muted">Loading…</p>

    <template v-else-if="category">
      <div class="border border-ink-border rounded-xl bg-ink-surface p-6 sm:p-8">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p class="font-mono text-xs uppercase tracking-widest2 text-amber mb-1">
              Category № {{ String(category.id).padStart(3, '0') }}
            </p>
            <h1 class="font-display text-3xl font-semibold text-paper">{{ category.name }}</h1>
            <span
              class="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-mono"
              :class="category.is_active ? 'bg-sage/10 text-sage border border-sage/30' : 'bg-ink-border text-muted border border-ink-border'"
            >
              {{ category.is_active ? 'Active' : 'Hidden' }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <RouterLink
              :to="`/categories/${category.id}/edit`"
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-ink-border text-paper text-sm hover:bg-ink-raised transition-colors"
            >
              <Pencil :size="14" /> Edit
            </RouterLink>
            <button
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-rust/30 text-rust text-sm hover:bg-rust/10 transition-colors"
              @click="confirmingDelete = true"
            >
              <Trash2 :size="14" /> Delete
            </button>
          </div>
        </div>

        <p class="text-muted mt-4 max-w-2xl">{{ category.description || 'No description provided.' }}</p>
      </div>

      <div class="border border-ink-border rounded-xl bg-ink-surface p-5">
        <h2 class="font-display font-semibold text-paper flex items-center gap-2 mb-4">
          <Package :size="16" class="text-amber" /> Products in this category
        </h2>

        <p v-if="!category.products || category.products.length === 0" class="text-sm text-muted">
          No products assigned yet.
          <RouterLink to="/products/new" class="text-amber hover:underline">Add one</RouterLink>.
        </p>

        <ul v-else class="divide-y divide-ink-border">
          <li v-for="p in category.products" :key="p.id" class="py-2.5 flex items-center justify-between gap-3 flex-wrap">
            <RouterLink :to="`/products/${p.id}`" class="text-sm text-paper hover:text-amber">
              {{ p.name }}
            </RouterLink>
            <div class="flex items-center gap-4">
              <span class="font-mono text-xs text-muted">{{ currency(p.price) }}</span>
              <StockGauge :stock="p.stock" />
            </div>
          </li>
        </ul>
      </div>
    </template>

    <ConfirmDialog
      :open="confirmingDelete"
      title="Remove category"
      :message="`Delete '${category?.name}'? This cannot be undone.`"
      :busy="deleting"
      @cancel="confirmingDelete = false"
      @confirm="confirmDelete"
    />
  </div>
</template>
