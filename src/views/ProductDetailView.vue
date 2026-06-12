<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { ArrowLeft, Pencil, Trash2, Tag } from 'lucide-vue-next'
import productsApi from '../api/products'
import StockGauge from '../components/StockGauge.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()

const product = ref(null)
const loading = ref(true)
const error = ref('')
const confirmingDelete = ref(false)
const deleting = ref(false)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await productsApi.get(route.params.id)
    product.value = res.data.data ?? res.data
  } catch (e) {
    error.value = 'Could not load this product.'
  } finally {
    loading.value = false
  }
}

onMounted(load)

async function confirmDelete() {
  deleting.value = true
  try {
    await productsApi.remove(route.params.id)
    router.push('/products')
  } catch (e) {
    error.value = 'Could not remove this product.'
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
  <div class="max-w-2xl space-y-6">
    <RouterLink to="/products" class="inline-flex items-center gap-1.5 text-sm text-muted hover:text-paper">
      <ArrowLeft :size="14" /> Back to products
    </RouterLink>

    <p v-if="error" class="text-rust text-sm">{{ error }}</p>
    <p v-else-if="loading" class="text-sm text-muted">Loading…</p>

    <template v-else-if="product">
      <div class="border border-ink-border rounded-xl bg-ink-surface p-6 sm:p-8 space-y-6">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p class="font-mono text-xs uppercase tracking-widest2 text-amber mb-1">
              Product № {{ String(product.id).padStart(3, '0') }}
            </p>
            <h1 class="font-display text-3xl font-semibold text-paper">{{ product.name }}</h1>
            <RouterLink
              v-if="product.category"
              :to="`/categories/${product.category.id}`"
              class="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-mono border border-ink-border text-muted hover:text-amber hover:border-amber transition-colors"
            >
              <Tag :size="12" /> {{ product.category.name }}
            </RouterLink>
          </div>
          <div class="flex items-center gap-2">
            <RouterLink
              :to="`/products/${product.id}/edit`"
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

        <p class="text-muted">{{ product.description || 'No description provided.' }}</p>

        <div class="grid grid-cols-3 gap-px bg-ink-border rounded-lg overflow-hidden border border-ink-border">
          <div class="bg-ink p-4">
            <p class="font-mono text-xs uppercase tracking-widest2 text-muted mb-1">Price</p>
            <p class="font-display text-xl font-semibold text-amber">{{ currency(product.price) }}</p>
          </div>
          <div class="bg-ink p-4">
            <p class="font-mono text-xs uppercase tracking-widest2 text-muted mb-1">Stock</p>
            <StockGauge :stock="product.stock" />
          </div>
          <div class="bg-ink p-4">
            <p class="font-mono text-xs uppercase tracking-widest2 text-muted mb-1">Status</p>
            <span
              class="inline-block px-2 py-0.5 rounded-full text-xs font-mono"
              :class="product.is_active ? 'bg-sage/10 text-sage border border-sage/30' : 'bg-ink-border text-muted border border-ink-border'"
            >
              {{ product.is_active ? 'Active' : 'Hidden' }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <ConfirmDialog
      :open="confirmingDelete"
      title="Remove product"
      :message="`Delete '${product?.name}'? This cannot be undone.`"
      :busy="deleting"
      @cancel="confirmingDelete = false"
      @confirm="confirmDelete"
    />
  </div>
</template>
