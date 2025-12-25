import { Module } from 'vuex';
import { audioService, AudioSource } from '../api';

export interface AudioState {
  audioSources: AudioSource[];
  currentAudio: AudioSource | null;
  loading: boolean;
  backgroundLoading: boolean;
  error: string | null;
}

const audioModule: Module<AudioState, any> = {
  namespaced: true,
  
  state: (): AudioState => ({
    audioSources: [],
    currentAudio: null,
    loading: false,
    backgroundLoading: false,
    error: null
  }),
  
  getters: {
    audioSources: (state): AudioSource[] => state.audioSources,
    currentAudio: (state): AudioSource | null => state.currentAudio,
    isLoading: (state): boolean => state.loading,
    isBackgroundLoading: (state): boolean => state.backgroundLoading,
    error: (state): string | null => state.error
  },
  
  mutations: {
    SET_AUDIO_SOURCES(state, audioSources: AudioSource[]) {
      state.audioSources = audioSources;
    },
    
    SET_CURRENT_AUDIO(state, audio: AudioSource | null) {
      state.currentAudio = audio;
    },
    
    SET_LOADING(state, loading: boolean) {
      state.loading = loading;
    },
    
    SET_BACKGROUND_LOADING(state, loading: boolean) {
      state.backgroundLoading = loading;
    },
    
    SET_ERROR(state, error: string | null) {
      state.error = error;
    }
  },
  
  actions: {
    async fetchAudioSources({ commit, state }) {
      if (state.audioSources.length > 0) {
        commit('SET_BACKGROUND_LOADING', true);
      } else {
        commit('SET_LOADING', true);
      }
      commit('SET_ERROR', null);
      
      try {
        const response = await audioService.getAudioSources();
        commit('SET_AUDIO_SOURCES', response.data);
        return response;
      } catch (error: any) {
        commit('SET_ERROR', error.message || 'Failed to fetch audio sources');
        throw error;
      } finally {
        commit('SET_LOADING', false);
        commit('SET_BACKGROUND_LOADING', false);
      }
    },
    
    async fetchAudioSource({ commit }, id: string | number) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const response = await audioService.getAudioSource(id);
        commit('SET_CURRENT_AUDIO', response.data);
        return response;
      } catch (error: any) {
        commit('SET_ERROR', error.message || 'Failed to fetch audio source');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async createAudioSource({ dispatch }, data) {
      try {
        const response = await audioService.createAudioSource(data);
        await dispatch('fetchAudioSources');
        return response;
      } catch (error) {
        throw error;
      }
    },

    async updateAudioSource({ dispatch }, { documentId, data }) {
      try {
        const response = await audioService.updateAudioSource(documentId, data);
        await dispatch('fetchAudioSources');
        return response;
      } catch (error) {
        throw error;
      }
    },
    
    async uploadFiles(_, payload: File[] | { files: File[], onUploadProgress?: (progressEvent: any) => void }) {
      let files: File[];
      let onUploadProgress: ((progressEvent: any) => void) | undefined;

      if (Array.isArray(payload)) {
        files = payload;
      } else {
        files = payload.files;
        onUploadProgress = payload.onUploadProgress;
      }

      try {
        return await audioService.uploadFiles(files, onUploadProgress);
      } catch (error) {
        throw error;
      }
    },
    
    async deleteAudioSource({ dispatch }, documentId: string) {
      try {
        await audioService.deleteAudioSource(documentId);
        await dispatch('fetchAudioSources');
      } catch (error) {
        throw error;
      }
    },
    
    async transcribeAudioSource({ dispatch }, documentId: string) {
      try {
        const response = await audioService.transcribeAudioSource(documentId);
        await dispatch('fetchAudioSources');
        return response;
      } catch (error) {
        throw error;
      }
    }
  }
};

export default audioModule;
