import { RouteRecordRaw } from 'vue-router';
import IdeasList from '../views/IdeasList.vue';
import IdeaDetail from '../views/IdeaDetail.vue';

const ideasRoutes: Array<RouteRecordRaw> = [
  {
    path: '/ideas',
    name: 'IdeasList',
    component: IdeasList,
    meta: { requiresAuth: true }
  },
  {
    path: '/ideas/:id',
    name: 'IdeaDetail',
    component: IdeaDetail,
    meta: { requiresAuth: true }
  }
];

export default ideasRoutes;
