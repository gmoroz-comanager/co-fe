import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import BrandProfile from '../views/BrandProfile.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/brand-profile',
    name: 'BrandProfile',
    component: BrandProfile,
    meta: { requiresAuth: true },
  },
];

export default routes;

