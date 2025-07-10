import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import CollectionsView from '@/views/CollectionsView.vue';
import SearchInterfaceView from '@/views/SearchInterfaceView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/plus',
      name: 'plus',
      component: () => import('@/views/PlusView.vue'),
    },
    {
      path: '/collections',
      name: 'collections',
      component: CollectionsView,
    },
    {
      path: '/references',
      name: 'references',
      component: () => import('@/views/ReferencesView.vue'),
    },
    {
      path: '/help',
      name: 'help',
      component: () => import('@/views/HelpView.vue'),
    },
    {
      path: '/searchInterface',
      name: 'searchInterface',
      component: SearchInterfaceView
    }
  ],
})

export default router
