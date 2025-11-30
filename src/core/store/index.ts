import { createStore } from 'vuex';
import authModule from '@/modules/auth/store/auth.store';
import ideasModule from '@/modules/ideas/store/ideas.store';
import audioModule from '@/modules/audio/store';
import brandProfileModule from '@/modules/brand-profile/store/brand-profile.store';
import homeModule from '@/modules/home/store';
import { strategyModule } from '@/modules/strategy/store/strategy.store';

export interface RootState {
  // Define root state properties here if any
}

const store = createStore<RootState>({
  modules: {
    auth: authModule,
    ideas: ideasModule,
    strategy: strategyModule,
    audio: audioModule,
    brandProfile: brandProfileModule,
    home: homeModule,
  },
});

export default store;
