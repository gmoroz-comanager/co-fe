import { RouteRecordRaw } from 'vue-router';

const SessionsList = () => import('../views/SessionsList.vue');
const SessionDetail = () => import('../views/SessionDetail.vue');
const AudioSourceDetail = () => import('../views/AudioSourceDetail.vue');

const sessionsRoutes: Array<RouteRecordRaw> = [
  {
    path: '/sessions',
    name: 'SessionsList',
    component: SessionsList,
    meta: { requiresAuth: true },
  },
  {
    path: '/sessions/:id',
    name: 'SessionDetail',
    component: SessionDetail,
    meta: { requiresAuth: true },
  },
  {
    path: '/sessions/:sessionId/sources/:sourceId',
    name: 'AudioSourceDetail',
    component: AudioSourceDetail,
    meta: { requiresAuth: true },
  },
];

export default sessionsRoutes;
