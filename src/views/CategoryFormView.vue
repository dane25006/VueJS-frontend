<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { ArrowLeft, Save } from 'lucide-vue-next'
import categoriesApi from '../api/categories'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const loading = ref(isEdit.value)
const saving = ref(false)
const error = ref('')
const fieldErrors = ref({})

const form = reactive({
  name: '',
  description: '',
  is_active: true,
})

onMounted(async () => {
  if (!isEdit.value) return
  try {
    const res = await categoriesApi.get(route.params.id)
    const data = res.data.data ?? res.data
    form.name = data.name
    form.description = data.description ?? ''
    form.is_active = !!data.is_active
  } catch (e) {
    error.value = 'Could not load this category.'
  } finally {
    loading.value = false
  }
})

async function submit() {
  saving.value = true
  error.value = ''
  fieldErrors.value = {}
  try {
    if (isEdit.value) {
      await categoriesApi.update(route.params.id, form)
      router.push(`/categories/${route.params.id}`)
    } else {
      const res = await categoriesApi.create(form)
      const data = res.data.data ?? res.data
      router.push(`/categories/${data.id}`)
    }
  } catch (e) {
    if (e.response?.status === 422) {
      fieldErrors.value = e.response.data.errors ?? {}
      error.value = 'Please fix the highlighted fields.'
    } else {
      error.value = 'Could not save this category.'
    }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-xl space-y-6">
    <RouterLink to="/categories" class="inline-flex items-center gap-1.5 text-sm text-muted hover:text-paper">
      <ArrowLeft :size="14" /> Back to categories
    </RouterLink>

    <div>
      <p class="font-mono text-xs uppercase tracking-widest2 text-amber mb-1">
        {{ isEdit ? 'Edit entry' : 'New entry' }}
      </p>
      <h1 class="font-display text-2xl font-semibold text-paper">
        {{ isEdit ? 'Edit category' : 'New category' }}
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
          placeholder="e.g. Beverages"
          class="w-full rounded-md bg-ink border border-ink-border px-3 py-2 text-sm text-paper placeholder:text-muted/60 focus:border-amber"
        />
        <p v-if="fieldErrors.name" class="text-rust text-xs mt-1">{{ fieldErrors.name[0] }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-paper mb-1.5" for="description">Description</label>
        <textarea
          id="description"
          v-model="form.description"
          rows="4"
          placeholder="What belongs in this category?"
          class="w-full rounded-md bg-ink border border-ink-border px-3 py-2 text-sm text-paper placeholder:text-muted/60 focus:border-amber"
        />
        <p v-if="fieldErrors.description" class="text-rust text-xs mt-1">{{ fieldErrors.description[0] }}</p>
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
          <Save :size="16" /> {{ saving ? 'Saving…' : 'Save category' }}
        </button>
        <RouterLink
          to="/categories"
          class="px-4 py-2 rounded-md border border-ink-border text-paper text-sm hover:bg-ink-raised transition-colors"
        >
          Cancel
        </RouterLink>
      </div>
    </form>
  </div>
</template>
