<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Eye, Pencil, Trash2, PlusCircle, Tags } from 'lucide-vue-next'
import categoriesApi from '../api/categories'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const categories = ref([])
const loading = ref(true)
const error = ref('')

const pendingDelete = ref(null)
const deleting = ref(false)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await categoriesApi.list()
    categories.value = res.data.data ?? res.data
  } catch (e) {
    error.value = 'Could not load categories from the API.'
  } finally {
    loading.value = false
  }
}

onMounted(load)

function askDelete(category) {
  pendingDelete.value = category
}

async function confirmDelete() {
  if (!pendingDelete.value) return
  deleting.value = true
  try {
    await categoriesApi.remove(pendingDelete.value.id)
    categories.value = categories.value.filter((c) => c.id !== pendingDelete.value.id)
    pendingDelete.value = null
  } catch (e) {
    error.value = 'Could not remove this category. It may still have products attached.'
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <p class="font-mono text-xs uppercase tracking-widest2 text-amber mb-1">№ 02 — Catalog</p>
        <h1 class="font-display text-2xl font-semibold text-paper flex items-center gap-2">
          <Tags :size="20" class="text-amber" /> Categories
        </h1>
      </div>
      <RouterLink
        to="/categories/new"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-amber text-ink font-display font-semibold text-sm hover:bg-amber-dim transition-colors"
      >
        <PlusCircle :size="16" /> New category
      </RouterLink>
    </div>

    <p v-if="error" class="text-rust text-sm">{{ error }}</p>

    <div class="border border-ink-border rounded-xl bg-ink-surface overflow-hidden">
      <p v-if="loading" class="p-6 text-sm text-muted">Loading…</p>
      <p v-else-if="categories.length === 0" class="p-6 text-sm text-muted">
        No categories yet. <RouterLink to="/categories/new" class="text-amber hover:underline">Add the first one</RouterLink>.
      </p>

      <table v-else class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs uppercase tracking-widest2 text-muted font-mono border-b border-ink-border">
            <th class="px-5 py-3 w-16">No.</th>
            <th class="px-5 py-3">Name</th>
            <th class="px-5 py-3 hidden sm:table-cell">Description</th>
            <th class="px-5 py-3 w-24">Status</th>
            <th class="px-5 py-3 w-28 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-ink-border">
          <tr v-for="(c, i) in categories" :key="c.id" class="hover:bg-ink-raised/50 transition-colors">
            <td class="px-5 py-3 font-mono text-muted">{{ String(i + 1).padStart(3, '0') }}</td>
            <td class="px-5 py-3 text-paper font-medium">{{ c.name }}</td>
            <td class="px-5 py-3 text-muted hidden sm:table-cell truncate max-w-xs">
              {{ c.description || '—' }}
            </td>
            <td class="px-5 py-3">
              <span
                class="px-2 py-0.5 rounded-full text-xs font-mono"
                :class="c.is_active ? 'bg-sage/10 text-sage border border-sage/30' : 'bg-ink-border text-muted border border-ink-border'"
              >
                {{ c.is_active ? 'Active' : 'Hidden' }}
              </span>
            </td>
            <td class="px-5 py-3">
              <div class="flex items-center justify-end gap-1">
                <RouterLink
                  :to="`/categories/${c.id}`"
                  class="p-1.5 rounded-md text-muted hover:text-paper hover:bg-ink-border transition-colors"
                  title="View"
                >
                  <Eye :size="16" />
                </RouterLink>
                <RouterLink
                  :to="`/categories/${c.id}/edit`"
                  class="p-1.5 rounded-md text-muted hover:text-amber hover:bg-ink-border transition-colors"
                  title="Edit"
                >
                  <Pencil :size="16" />
                </RouterLink>
                <button
                  class="p-1.5 rounded-md text-muted hover:text-rust hover:bg-ink-border transition-colors"
                  title="Delete"
                  @click="askDelete(c)"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ConfirmDialog
      :open="!!pendingDelete"
      title="Remove category"
      :message="`Delete '${pendingDelete?.name}'? Products in this category will keep their record but lose this grouping.`"
      :busy="deleting"
      @cancel="pendingDelete = null"
      @confirm="confirmDelete"
    />
  </div>
</template>
