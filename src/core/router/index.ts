import { createRouter, createWebHistory, RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import store from '@/core/store';
import homeRoutes from '@/modules/home/router';
import authRoutes from '@/modules/auth/router';
import ideasRoutes from '@/modules/ideas/router';
import audioRoutes from '@/modules/audio/router';
import strategyRoutes from '@/modules/strategy/router';
import onboardingRoutes from '@/modules/onboarding/router';
import brandProfileRoutes from '@/modules/brand-profile/router';

const routes: Array<RouteRecordRaw> = [
  ...homeRoutes,
  ...authRoutes,
  ...ideasRoutes,
  ...strategyRoutes,
  ...audioRoutes,
  ...brandProfileRoutes,
  ...onboardingRoutes,
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
    // Check if user needs to complete onboarding
    if (currentUser && currentUser.id && !currentUser.finishedOnboardingStage1) {
      return next('/onboarding/stage1');
    }
    // Redirect to stage 2 if stage 1 is done but onboarding is not complete
    else if (currentUser && currentUser.id && !currentUser.onboardingComplete) {
      return next('/onboarding/stage2');
    }
  }
  
  next();
});

export default router;
