import { Module } from 'vuex';
import { contentStrategyService, ContentStrategy, ContentStrategyFilters, StrategyCreationData } from '../api/strategy.service';

export interface StrategyState {
  strategies: ContentStrategy[];
  currentStrategy: ContentStrategy | null;
  totalStrategies: number;
  publishedStrategies: number;
  draftStrategies: number;
  loading: boolean;
  error: string | null;
  filters: ContentStrategyFilters;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
  creationData: Partial<StrategyCreationData>;
  currentStep: number;
}

export const strategyModule: Module<StrategyState, any> = {
  namespaced: true,
  
  state: (): StrategyState => ({
    strategies: [],
    currentStrategy: null,
    totalStrategies: 0,
    publishedStrategies: 0,
    draftStrategies: 0,
    loading: false,
    error: null,
    filters: {
      sort: 'createdAt:desc',
      page: 1,
      pageSize: 10
    },
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0,
      pageCount: 0
    },
    creationData: {},
    currentStep: 1
  }),
  
  getters: {
    allStrategies: (state): ContentStrategy[] => state.strategies,
    currentStrategy: (state): ContentStrategy | null => state.currentStrategy,
    recentStrategies: (state): ContentStrategy[] => state.strategies.slice(0, 3),
    totalStrategies: (state): number => state.totalStrategies,
    publishedStrategies: (state): number => state.publishedStrategies,
    draftStrategies: (state): number => state.draftStrategies,
    isLoading: (state): boolean => state.loading,
    filters: (state): ContentStrategyFilters => state.filters,
    pagination: (state): any => state.pagination,
    creationData: (state): Partial<StrategyCreationData> => state.creationData,
    currentStep: (state): number => state.currentStep,
    isStepComplete: (state) => (step: number): boolean => {
      switch (step) {
        case 1:
          return !!(state.creationData.step1?.name && 
                   state.creationData.step1?.personaType && 
                   state.creationData.step1?.targetAudience);
        case 2:
          return !!(state.creationData.step2?.toneType && 
                   state.creationData.step2?.formality && 
                   state.creationData.step2?.sentenceLength);
        case 3:
          return !!(state.creationData.step3?.lexiconPreferred && 
                   state.creationData.step3?.coreValues);
        case 4:
          return !!(state.creationData.step4?.targetPostCount && 
                   state.creationData.step4?.mainGoalsArray);
        default:
          return false;
      }
    }
  },
  
  mutations: {
    SET_STRATEGIES(state, strategies: ContentStrategy[]) {
      state.strategies = strategies;
    },
    
    SET_CURRENT_STRATEGY(state, strategy: ContentStrategy | null) {
      state.currentStrategy = strategy;
    },
    
    SET_TOTAL_STRATEGIES(state, total: number) {
      state.totalStrategies = total;
    },
    
    SET_PUBLISHED_STRATEGIES(state, count: number) {
      state.publishedStrategies = count;
    },
    
    SET_DRAFT_STRATEGIES(state, count: number) {
      state.draftStrategies = count;
    },
    
    SET_LOADING(state, loading: boolean) {
      state.loading = loading;
    },
    
    SET_ERROR(state, error: string | null) {
      state.error = error;
    },
    
    SET_FILTERS(state, filters: Partial<ContentStrategyFilters>) {
      state.filters = { ...state.filters, ...filters };
    },
    
    SET_PAGINATION(state, pagination: any) {
      state.pagination = pagination;
    },
    
    SET_CREATION_DATA(state, data: Partial<StrategyCreationData>) {
      state.creationData = { ...state.creationData, ...data };
    },
    
    SET_CURRENT_STEP(state, step: number) {
      state.currentStep = step;
    },
    
    RESET_CREATION_DATA(state) {
      state.creationData = {};
      state.currentStep = 1;
    }
  },
  
  actions: {
    async fetchStrategies({ commit, state }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const response = await contentStrategyService.getStrategies(state.filters);
        
        commit('SET_STRATEGIES', response.data);
        commit('SET_PAGINATION', response.meta.pagination);
        
        // Get counts
        const counts = await contentStrategyService.countStrategies();
        commit('SET_TOTAL_STRATEGIES', counts.total);
        commit('SET_PUBLISHED_STRATEGIES', counts.published);
        commit('SET_DRAFT_STRATEGIES', counts.draft);
        
        return response;
      } catch (error: any) {
        console.error('Error fetching strategies:', error);
        commit('SET_ERROR', error.message || 'Failed to fetch strategies');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchStrategy({ commit }, id: string | number) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      commit('SET_CURRENT_STRATEGY', null);
      
      try {
        const response = await contentStrategyService.getStrategy(id);
        commit('SET_CURRENT_STRATEGY', response.data);
        return response;
      } catch (error: any) {
        console.error('Error fetching strategy:', error);
        commit('SET_ERROR', error.message || 'Failed to fetch strategy details');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async createStrategy({ dispatch }, data: any) {
      try {
        const response = await contentStrategyService.createStrategy(data);
        await dispatch('fetchStrategies');
        return response;
      } catch (error: any) {
        console.error('Error creating strategy:', error);
        throw error;
      }
    },
    
    async updateStrategy({ dispatch }, { id, data }: { id: string | number; data: any }) {
      try {
        const response = await contentStrategyService.updateStrategy(id, data);
        await dispatch('fetchStrategies');
        return response;
      } catch (error: any) {
        console.error('Error updating strategy:', error);
        throw error;
      }
    },
    
    async deleteStrategy({ dispatch }, id: string | number) {
      try {
        await contentStrategyService.deleteStrategy(id);
        await dispatch('fetchStrategies');
      } catch (error: any) {
        console.error('Error deleting strategy:', error);
        throw error;
      }
    },
    
    async publishStrategy({ dispatch }, id: string | number) {
      try {
        const response = await contentStrategyService.publishStrategy(id);
        await dispatch('fetchStrategies');
        return response;
      } catch (error: any) {
        console.error('Error publishing strategy:', error);
        throw error;
      }
    },
    
    async unpublishStrategy({ dispatch }, id: string | number) {
      try {
        const response = await contentStrategyService.unpublishStrategy(id);
        await dispatch('fetchStrategies');
        return response;
      } catch (error: any) {
        console.error('Error unpublishing strategy:', error);
        throw error;
      }
    },
    
    updateFilters({ commit, dispatch }, filters: Partial<ContentStrategyFilters>) {
      commit('SET_FILTERS', filters);
      return dispatch('fetchStrategies');
    },
    
    resetFilters({ commit, dispatch }) {
      commit('SET_FILTERS', {
        sort: 'createdAt:desc',
        page: 1,
        pageSize: 10
      });
      return dispatch('fetchStrategies');
    },
    
    updateCreationData({ commit }, data: Partial<StrategyCreationData>) {
      commit('SET_CREATION_DATA', data);
    },
    
    setCurrentStep({ commit }, step: number) {
      commit('SET_CURRENT_STEP', step);
    },
    
    resetCreationProcess({ commit }) {
      commit('RESET_CREATION_DATA');
    },
    
    async saveStrategyFromCreationData({ commit, state, dispatch }) {
      try {
        const { step1, step2, step3, step4 } = state.creationData;
        
        if (!step1 || !step2 || !step3 || !step4) {
          throw new Error('Incomplete strategy data');
        }
        
        const strategyData = {
          ...step1,
          ...step2,
          ...step3,
          ...step4
        };
        
        const response = await dispatch('createStrategy', strategyData);
        commit('RESET_CREATION_DATA');
        return response;
      } catch (error: any) {
        console.error('Error saving strategy from creation data:', error);
        throw error;
      }
    }
  }
};



