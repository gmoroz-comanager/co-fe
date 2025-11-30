import { RouteRecordRaw } from 'vue-router';
import Home from '../views/pages/Home.vue';

const homeRoutes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true },
  },
];

export default homeRoutes;

