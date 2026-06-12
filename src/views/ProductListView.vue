<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Eye, Pencil, Trash2, PlusCircle, Boxes } from 'lucide-vue-next'
import productsApi from '../api/products'
import categoriesApi from '../api/categories'
import StockGauge from '../components/StockGauge.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const products = ref([])
const categories = ref([])
const loading = ref(true)
const error = ref('')
const categoryFilter = ref('')

const pendingDelete = ref(null)
const deleting = ref(false)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [prodRes, catRes] = await Promise.all([productsApi.list(), categoriesApi.list()])
    products.value = prodRes.data.data ?? prodRes.data
    categories.value = catRes.data.data ?? catRes.data
  } catch (e) {
    error.value = 'Could not load products from the API.'
  } finally {
    loading.value = false
  }
}

onMounted(load)

const filtered = computed(() => {
  if (!categoryFilter.value) return products.value
  return products.value.filter((p) => String(p.category_id) === String(categoryFilter.value))
})

function categoryName(p) {
  if (p.category?.name) return p.category.name
  const c = categories.value.find((c) => c.id === p.category_id)
  return c?.name ?? '—'
}

function currency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n) || 0)
}

function askDelete(product) {
  pendingDelete.value = product
}

async function confirmDelete() {
  if (!pendingDelete.value) return
  deleting.value = true
  try {
    await productsApi.remove(pendingDelete.value.id)
    products.value = products.value.filter((p) => p.id !== pendingDelete.value.id)
    pendingDelete.value = null
  } catch (e) {
    error.value = 'Could not remove this product.'
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <p class="font-mono text-xs uppercase tracking-widest2 text-amber mb-1">№ 03 — Catalog</p>
        <h1 class="font-display text-2xl font-semibold text-paper flex items-center gap-2">
          <Boxes :size="20" class="text-amber" /> Products
        </h1>
      </div>
      <RouterLink
        to="/products/new"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-amber text-ink font-display font-semibold text-sm hover:bg-amber-dim transition-colors"
      >
        <PlusCircle :size="16" /> New product
      </RouterLink>
    </div>

    <p v-if="error" class="text-rust text-sm">{{ error }}</p>

    <div class="flex items-center gap-2">
      <label for="cat-filter" class="text-xs font-mono uppercase tracking-widest2 text-muted">Filter</label>
      <select
        id="cat-filter"
        v-model="categoryFilter"
        class="rounded-md bg-ink-surface border border-ink-border px-3 py-1.5 text-sm text-paper focus:border-amber"
      >
        <option value="">All categories</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </div>

    <div class="border border-ink-border rounded-xl bg-ink-surface overflow-hidden">
      <p v-if="loading" class="p-6 text-sm text-muted">Loading…</p>
      <p v-else-if="filtered.length === 0" class="p-6 text-sm text-muted">
        No products found. <RouterLink to="/products/new" class="text-amber hover:underline">Add the first one</RouterLink>.
      </p>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs uppercase tracking-widest2 text-muted font-mono border-b border-ink-border">
              <th class="px-5 py-3 w-16">No.</th>
              <th class="px-5 py-3">Name</th>
              <th class="px-5 py-3 hidden sm:table-cell">Category</th>
              <th class="px-5 py-3">Price</th>
              <th class="px-5 py-3">Stock</th>
              <th class="px-5 py-3 w-24">Status</th>
              <th class="px-5 py-3 w-28 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-ink-border">
            <tr v-for="(p, i) in filtered" :key="p.id" class="hover:bg-ink-raised/50 transition-colors">
              <td class="px-5 py-3 font-mono text-muted">{{ String(i + 1).padStart(3, '0') }}</td>
              <td class="px-5 py-3 text-paper font-medium">{{ p.name }}</td>
              <td class="px-5 py-3 text-muted hidden sm:table-cell">{{ categoryName(p) }}</td>
              <td class="px-5 py-3 font-mono text-paper">{{ currency(p.price) }}</td>
              <td class="px-5 py-3"><StockGauge :stock="p.stock" /></td>
              <td class="px-5 py-3">
                <span
                  class="px-2 py-0.5 rounded-full text-xs font-mono"
                  :class="p.is_active ? 'bg-sage/10 text-sage border border-sage/30' : 'bg-ink-border text-muted border border-ink-border'"
                >
                  {{ p.is_active ? 'Active' : 'Hidden' }}
                </span>
              </td>
              <td class="px-5 py-3">
                <div class="flex items-center justify-end gap-1">
                  <RouterLink
                    :to="`/products/${p.id}`"
                    class="p-1.5 rounded-md text-muted hover:text-paper hover:bg-ink-border transition-colors"
                    title="View"
                  >
                    <Eye :size="16" />
                  </RouterLink>
                  <RouterLink
                    :to="`/products/${p.id}/edit`"
                    class="p-1.5 rounded-md text-muted hover:text-amber hover:bg-ink-border transition-colors"
                    title="Edit"
                  >
                    <Pencil :size="16" />
                  </RouterLink>
                  <button
                    class="p-1.5 rounded-md text-muted hover:text-rust hover:bg-ink-border transition-colors"
                    title="Delete"
                    @click="askDelete(p)"
                  >
                    <Trash2 :size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ConfirmDialog
      :open="!!pendingDelete"
      title="Remove product"
      :message="`Delete '${pendingDelete?.name}'? This cannot be undone.`"
      :busy="deleting"
      @cancel="pendingDelete = null"
      @confirm="confirmDelete"
    />
  </div>
</template>
