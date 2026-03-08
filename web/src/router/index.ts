import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue')
    },
    {
      path: '/flow-analysis',
      name: 'FlowAnalysis',
      component: () => import('@/views/FlowAnalysis.vue')
    },
    {
      path: '/legal-documents',
      name: 'LegalDocuments',
      component: () => import('@/views/LegalDocuments.vue')
    },
    {
      path: '/history',
      name: 'History',
      component: () => import('@/views/History.vue')
    }
  ]
})

export default router
