<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { ArrowLeft, Save } from 'lucide-vue-next'
import productsApi from '../api/products'
import categoriesApi from '../api/categories'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const fieldErrors = ref({})
const categories = ref([])

const form = reactive({
  category_id: '',
  name: '',
  description: '',
  price: '',
  stock: 0,
  is_active: true,
})

onMounted(async () => {
  try {
    const catRes = await categoriesApi.list()
    categories.value = catRes.data.data ?? catRes.data

    if (isEdit.value) {
      const res = await productsApi.get(route.params.id)
      const data = res.data.data ?? res.data
      form.category_id = data.category_id
      form.name = data.name
      form.description = data.description ?? ''
      form.price = data.price
      form.stock = data.stock
      form.is_active = !!data.is_active
    } else if (categories.value.length) {
      form.category_id = categories.value[0].id
    }
  } catch (e) {
    error.value = 'Could not load form data.'
  } finally {
    loading.value = false
  }
})

async function submit() {
  saving.value = true
  error.value = ''
  fieldErrors.value = {}
  try {
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      category_id: Number(form.category_id),
    }
    if (isEdit.value) {
      await productsApi.update(route.params.id, payload)
      router.push(`/products/${route.params.id}`)
    } else {
      const res = await productsApi.create(payload)
      const data = res.data.data ?? res.data
      router.push(`/products/${data.id}`)
    }
  } catch (e) {
    if (e.response?.status === 422) {
      fieldErrors.value = e.response.data.errors ?? {}
      error.value = 'Please fix the highlighted fields.'
    } else {
      error.value = 'Could not save this product.'
    }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-xl space-y-6">
    <RouterLink to="/products" class="inline-flex items-center gap-1.5 text-sm text-muted hover:text-paper">
      <ArrowLeft :size="14" /> Back to products
    </RouterLink>

    <div>
      <p class="font-mono text-xs uppercase tracking-widest2 text-amber mb-1">
        {{ isEdit ? 'Edit entry' : 'New entry' }}
      </p>
      <h1 class="font-display text-2xl font-semibold text-paper">
        {{ isEdit ? 'Edit product' : 'New product' }}
      </h1>
    </div>

    <p v-if="loading" class="text-sm text-muted">Loading…</p>

    <form v-else @submit.prevent="submit" class="border border-ink-border rounded-xl bg-ink-surface p-6 space-y-5">
      <p v-if="error" class="text-rust text-sm">{{ error }}</p>

      <div>
        <label class="block text-sm font-medium text-paper mb-1.5" for="name">Name</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          placeholder="e.g. Iced Coffee 500ml"
          class="w-full rounded-md bg-ink border border-ink-border px-3 py-2 text-sm text-paper placeholder:text-muted/60 focus:border-amber"
        />
        <p v-if="fieldErrors.name" class="text-rust text-xs mt-1">{{ fieldErrors.name[0] }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-paper mb-1.5" for="category_id">Category</label>
        <select
          id="category_id"
          v-model="form.category_id"
          required
          class="w-full rounded-md bg-ink border border-ink-border px-3 py-2 text-sm text-paper focus:border-amber"
        >
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <p v-if="fieldErrors.category_id" class="text-rust text-xs mt-1">{{ fieldErrors.category_id[0] }}</p>
        <p v-if="categories.length === 0" class="text-xs text-muted mt-1">
          No categories yet — <RouterLink to="/categories/new" class="text-amber hover:underline">create one first</RouterLink>.
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-paper mb-1.5" for="description">Description</label>
        <textarea
          id="description"
          v-model="form.description"
          rows="3"
          placeholder="Short description shown on the product page"
          class="w-full rounded-md bg-ink border border-ink-border px-3 py-2 text-sm text-paper placeholder:text-muted/60 focus:border-amber"
        />
        <p v-if="fieldErrors.description" class="text-rust text-xs mt-1">{{ fieldErrors.description[0] }}</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-paper mb-1.5" for="price">Price (USD)</label>
          <input
            id="price"
            v-model="form.price"
            type="number"
            min="0"
            step="0.01"
            required
            class="w-full rounded-md bg-ink border border-ink-border px-3 py-2 text-sm font-mono text-paper focus:border-amber"
          />
          <p v-if="fieldErrors.price" class="text-rust text-xs mt-1">{{ fieldErrors.price[0] }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-paper mb-1.5" for="stock">Stock</label>
          <input
            id="stock"
            v-model="form.stock"
            type="number"
            min="0"
            step="1"
            required
            class="w-full rounded-md bg-ink border border-ink-border px-3 py-2 text-sm font-mono text-paper focus:border-amber"
          />
          <p v-if="fieldErrors.stock" class="text-rust text-xs mt-1">{{ fieldErrors.stock[0] }}</p>
        </div>
      </div>

      <label class="flex items-center gap-2 text-sm text-paper cursor-pointer">
        <input
          v-model="form.is_active"
          type="checkbox"
          class="w-4 h-4 rounded accent-amber bg-ink border-ink-border"
        />
        Active — visible in the catalog
      </label>

      <div class="flex items-center gap-2 pt-2">
        <button
          type="submit"
          :disabled="saving"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-amber text-ink font-display font-semibold text-sm hover:bg-amber-dim transition-colors disabled:opacity-50"
        >
          <Save :size="16" /> {{ saving ? 'Saving…' : 'Save product' }}
        </button>
        <RouterLink
          to="/products"
          class="px-4 py-2 rounded-md border border-ink-border text-paper text-sm hover:bg-ink-raised transition-colors"
        >
          Cancel
        </RouterLink>
      </div>
    </form>
  </div>
</template>
