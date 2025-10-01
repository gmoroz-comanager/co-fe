import { createStore } from 'vuex';
import authModule from '@/modules/auth/store';
import ideasModule from '@/modules/ideas/store';
import audioModule from '@/modules/audio/store';
import {strategyModule} from '@/modules/strategy/store';

const store = createStore({
  modules: {
    auth: authModule,
    ideas: ideasModule,
    audio: audioModule,
    strategy: strategyModule
  }
});

export default store;
