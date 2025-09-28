import { createStore } from 'vuex';
import authModule from '@/modules/auth/store';
import ideasModule from '@/modules/ideas/store';
import audioModule from '@/modules/audio/store';

const store = createStore({
  modules: {
    auth: authModule,
    ideas: ideasModule,
    audio: audioModule
  }
});

export default store;
