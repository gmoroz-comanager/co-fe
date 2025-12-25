import { createRouter, createWebHistory, RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import store from '@/core/store';
import { getOnboardingRedirect } from '@/core/helpers/onboarding';
import homeRoutes from '@/modules/home/router';
import authRoutes from '@/modules/auth/router';
import ideasRoutes from '@/modules/ideas/router';
import audioRoutes from '@/modules/audio/router';
import strategyRoutes from '@/modules/strategy/router';
import onboardingRoutes from '@/modules/onboarding/router';
import brandProfileRoutes from '@/modules/brand-profile/router';
import contactsRoutes from '@/modules/contacts/router';
import postingRoutes from '@/modules/posting/router';

const routes: Array<RouteRecordRaw> = [
  ...homeRoutes,
  ...authRoutes,
  ...ideasRoutes,
  ...strategyRoutes,
  ...audioRoutes,
  ...brandProfileRoutes,
  ...contactsRoutes,
  ...onboardingRoutes,
  ...postingRoutes,
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const isLoggedIn = store.getters['auth/isLoggedIn'];
  const currentUser = store.getters['auth/currentUser'];
  
  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isLoggedIn) {
      next('/login');
      return;
    }
  }
  
  // Check onboarding completion
  // Skip onboarding check for login, register, and onboarding routes
  const isAuthRoute = to.path === '/login' || to.path === '/register';
  const isOnboardingRoute = to.matched.some(record => record.meta.isOnboarding);
  
  if (isLoggedIn && !isAuthRoute && !isOnboardingRoute) {
    const redirectPath = getOnboardingRedirect(currentUser, false);
    if (redirectPath) {
      return next(redirectPath);
    }
  }
  
  next();
});

export default router;
