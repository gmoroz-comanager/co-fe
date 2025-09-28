import { createRouter, createWebHistory, RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import store from '@/core/store';
import Home from '@/views/Home.vue';
import authRoutes from '@/modules/auth/router';
import ideasRoutes from '@/modules/ideas/router';
import audioRoutes from '@/modules/audio/router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  ...authRoutes,
  ...ideasRoutes,
  ...audioRoutes
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.getters['auth/isLoggedIn']) {
      next('/login');
      return;
    }
  }
  next();
});

export default router;
