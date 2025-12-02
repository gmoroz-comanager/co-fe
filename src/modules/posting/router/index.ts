import { RouteRecordRaw } from 'vue-router';
import PostingSetup from '../views/PostingSetup.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/posting/setup',
    name: 'PostingSetup',
    component: PostingSetup,
    meta: { requiresAuth: true }
  }
];

export default routes;

