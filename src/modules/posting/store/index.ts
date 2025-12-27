import { Module } from 'vuex';
import { postingService, TelegramBot, TelegramChannel } from '../api/posting.service';

export interface PostingState {
  bots: TelegramBot[];
  channels: TelegramChannel[];
  loading: boolean;
  error: string | null;
}

const postingModule: Module<PostingState, any> = {
  namespaced: true,
  state: () => ({
    bots: [],
    channels: [],
    loading: false,
    error: null
  }),
  getters: {
    bots: (state) => state.bots,
    channels: (state) => state.channels,
    isLoading: (state) => state.loading
  },
  mutations: {
    SET_BOTS(state, bots) { state.bots = bots; },
    ADD_BOT(state, bot) { state.bots.push(bot); },
    SET_CHANNELS(state, channels) { state.channels = channels; },
    ADD_CHANNEL(state, channel) { 
        const index = state.channels.findIndex(c => c.documentId === channel.documentId);
        if (index !== -1) state.channels[index] = channel;
        else state.channels.push(channel); 
    },
    SET_LOADING(state, status) { state.loading = status; },
    SET_ERROR(state, error) { state.error = error; }
  },
  actions: {
    async fetchBots({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await postingService.getBots();
        commit('SET_BOTS', response.data);
      } catch (error: any) {
        commit('SET_ERROR', error.message);
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async fetchChannels({ commit }) {
        commit('SET_LOADING', true);
        try {
          const response = await postingService.getChannels();
          commit('SET_CHANNELS', response.data);
        } catch (error: any) {
          commit('SET_ERROR', error.message);
        } finally {
          commit('SET_LOADING', false);
        }
    },
    async registerBot({ commit }, token: string) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const response = await postingService.registerBot(token);
        commit('ADD_BOT', response.data);
        return response.data;
      } catch (error: any) {
        commit('SET_ERROR', error.response?.data?.error?.message || error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
   
    async startVerification({ commit }, botDocumentId: string) {
        try {
            return await postingService.startVerification(botDocumentId);
        } catch (error: any) {
            throw error;
        }
    },
    async checkVerificationStatus({ commit }, code: string) {
        try {
            return await postingService.checkVerificationStatus(code);
        } catch (error: any) {
            throw error;
        }
    }
  }
};

export default postingModule;

