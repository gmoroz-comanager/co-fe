import { RouteRecordRaw } from 'vue-router';
import PostingSetup from '../views/PostingSetup.vue';
import PostingCalendar from '../views/PostingCalendar.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/posting/setup',
    name: 'PostingSetup',
    component: PostingSetup,
    meta: { requiresAuth: true }
  },
  {
    path: '/posting/calendar',
    name: 'PostingCalendar',
    component: PostingCalendar,
    meta: { requiresAuth: true }
  }
];

export default routes;

