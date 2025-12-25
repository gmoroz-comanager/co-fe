import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import BrandProfile from '../views/BrandProfile.vue';
import store from '@/core/store';
import { getOnboardingRedirect } from '@/core/helpers/onboarding';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/brand-profile',
    name: 'BrandProfile',
    component: BrandProfile,
    meta: { requiresAuth: true },
    beforeEnter: (to, from, next) => {
      const currentUser = store.getters['auth/currentUser'];
      // Force onboarding flow for Brand Profile page
      const redirectPath = getOnboardingRedirect(currentUser, true);
      
      if (redirectPath) {
        next(redirectPath);
      } else {
        next();
      }
    }
  },
];

export default routes;

