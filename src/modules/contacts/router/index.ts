import { RouteRecordRaw } from 'vue-router';
import ContactsList from '../views/pages/ContactsList.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/contacts',
    name: 'ContactsList',
    component: ContactsList,
    meta: { requiresAuth: true }
  }
];

export default routes;

