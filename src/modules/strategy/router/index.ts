import { RouteRecordRaw } from 'vue-router';
import StrategiesList from '../views/StrategiesList.vue';
import StrategyDetail from '../views/StrategyDetail.vue';
import StrategyCreate from '../views/StrategyCreate.vue';
import StrategyCreateStep1 from '../views/StrategyCreateStep1.vue';
import StrategyCreateStep2 from '../views/StrategyCreateStep2.vue';
import StrategyCreateStep3 from '../views/StrategyCreateStep3.vue';
import StrategyCreateStep4 from '../views/StrategyCreateStep4.vue';

const strategyRoutes: Array<RouteRecordRaw> = [
  {
    path: '/strategies',
    name: 'StrategiesList',
    component: StrategiesList,
    meta: { requiresAuth: true }
  },
  {
    path: '/strategies/:id',
    name: 'StrategyDetail',
    component: StrategyDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/strategies/create',
    name: 'StrategyCreate',
    component: StrategyCreate,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: { name: 'StrategyCreateStep1' }
      },
      {
        path: 'step1',
        name: 'StrategyCreateStep1',
        component: StrategyCreateStep1,
        meta: { requiresAuth: true }
      },
      {
        path: 'step2',
        name: 'StrategyCreateStep2',
        component: StrategyCreateStep2,
        meta: { requiresAuth: true }
      },
      {
        path: 'step3',
        name: 'StrategyCreateStep3',
        component: StrategyCreateStep3,
        meta: { requiresAuth: true }
      },
      {
        path: 'step4',
        name: 'StrategyCreateStep4',
        component: StrategyCreateStep4,
        meta: { requiresAuth: true }
      }
    ]
  }
];

export default strategyRoutes;

