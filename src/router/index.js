import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import CategoryListView from '../views/CategoryListView.vue'
import CategoryFormView from '../views/CategoryFormView.vue'
import CategoryDetailView from '../views/CategoryDetailView.vue'
import ProductListView from '../views/ProductListView.vue'
import ProductFormView from '../views/ProductFormView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },

  { path: '/categories', name: 'categories.index', component: CategoryListView },
  { path: '/categories/new', name: 'categories.create', component: CategoryFormView },
  { path: '/categories/:id', name: 'categories.show', component: CategoryDetailView, props: true },
  { path: '/categories/:id/edit', name: 'categories.edit', component: CategoryFormView, props: true },

  { path: '/products', name: 'products.index', component: ProductListView },
  { path: '/products/new', name: 'products.create', component: ProductFormView },
  { path: '/products/:id', name: 'products.show', component: ProductDetailView, props: true },
  { path: '/products/:id/edit', name: 'products.edit', component: ProductFormView, props: true },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
