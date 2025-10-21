import { RouteRecordRaw } from 'vue-router';
import OnboardingStage1 from '../views/OnboardingStage1.vue';

const onboardingRoutes: Array<RouteRecordRaw> = [
  {
    path: '/onboarding/stage1',
    name: 'OnboardingStage1',
    component: OnboardingStage1,
    meta: { requiresAuth: true, isOnboarding: true }
  },
  {
    path: '/onboarding/stage2',
    name: 'OnboardingStage2',
    component: () => import('../views/OnboardingStage2.vue'), // Lazy load
    meta: { requiresAuth: true, isOnboarding: true }
  }
];

export default onboardingRoutes;

