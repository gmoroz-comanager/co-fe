import { RouteRecordRaw } from 'vue-router';
import AudioManager from '../views/AudioManager.vue';

const audioRoutes: Array<RouteRecordRaw> = [
  {
    path: '/audio',
    name: 'AudioManager',
    component: AudioManager,
    meta: { requiresAuth: true }
  }
];

export default audioRoutes;
