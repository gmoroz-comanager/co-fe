import { Module } from 'vuex';
import { ideasService, Idea, IdeaFilters } from '../api/ideas.service';

export interface IdeasState {
  ideas: Idea[];
  currentIdea: Idea | null;
  totalIdeas: number;
  newIdeas: number;
  loading: boolean;
  error: string | null;
  filters: IdeaFilters;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
}

const ideasModule: Module<IdeasState, any> = {
  namespaced: true,
  
  state: (): IdeasState => ({
    ideas: [],
    currentIdea: null,
    totalIdeas: 0,
    newIdeas: 0,
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
    }
  }),
  
  getters: {
    allIdeas: (state): Idea[] => state.ideas,
    currentIdea: (state): Idea | null => state.currentIdea,
    recentIdeas: (state): Idea[] => state.ideas.slice(0, 3),
    totalIdeas: (state): number => state.totalIdeas,
    newIdeas: (state): number => state.newIdeas,
    isLoading: (state): boolean => state.loading,
    filters: (state): IdeaFilters => state.filters,
    pagination: (state): any => state.pagination
  },
  
  mutations: {
    SET_IDEAS(state, ideas: Idea[]) {
      state.ideas = ideas;
    },
    
    SET_CURRENT_IDEA(state, idea: Idea | null) {
      state.currentIdea = idea;
    },
    
    SET_TOTAL_IDEAS(state, total: number) {
      state.totalIdeas = total;
    },
    
    SET_NEW_IDEAS(state, count: number) {
      state.newIdeas = count;
    },
    
    SET_LOADING(state, loading: boolean) {
      state.loading = loading;
    },
    
    SET_ERROR(state, error: string | null) {
      state.error = error;
    },
    
    SET_FILTERS(state, filters: Partial<IdeaFilters>) {
      state.filters = { ...state.filters, ...filters };
    },
    
    SET_PAGINATION(state, pagination: any) {
      state.pagination = pagination;
    }
  },
  
  actions: {
    async fetchIdeas({ commit, state }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const response = await ideasService.getIdeas(state.filters);
        
        commit('SET_IDEAS', response.data);
        commit('SET_PAGINATION', response.meta.pagination);
        
        // Get counts
        const counts = await ideasService.countIdeas();
        commit('SET_TOTAL_IDEAS', counts.total);
        commit('SET_NEW_IDEAS', counts.new);
        
        return response;
      } catch (error: any) {
        console.error('Error fetching ideas:', error);
        commit('SET_ERROR', error.message || 'Failed to fetch ideas');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchIdea({ commit }, id: string | number) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      commit('SET_CURRENT_IDEA', null);
      
      try {
        const response = await ideasService.getIdea(id);
        commit('SET_CURRENT_IDEA', response.data);
        return response;
      } catch (error: any) {
        console.error('Error fetching idea:', error);
        commit('SET_ERROR', error.message || 'Failed to fetch idea details');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async createIdea({ dispatch }, data: any) {
      try {
        const response = await ideasService.createIdea(data);
        await dispatch('fetchIdeas');
        return response;
      } catch (error: any) {
        console.error('Error creating idea:', error);
        throw error;
      }
    },
    
    async updateIdea({ dispatch }, { id, data }: { id: string | number; data: any }) {
      try {
        const response = await ideasService.updateIdea(id, data);
        await dispatch('fetchIdeas');
        return response;
      } catch (error: any) {
        console.error('Error updating idea:', error);
        throw error;
      }
    },
    
    async deleteIdea({ dispatch }, id: string | number) {
      try {
        await ideasService.deleteIdea(id);
        await dispatch('fetchIdeas');
      } catch (error: any) {
        console.error('Error deleting idea:', error);
        throw error;
      }
    },
    
    updateFilters({ commit, dispatch }, filters: Partial<IdeaFilters>) {
      commit('SET_FILTERS', filters);
      return dispatch('fetchIdeas');
    },
    
    resetFilters({ commit, dispatch }) {
      commit('SET_FILTERS', {
        sort: 'createdAt:desc',
        page: 1,
        pageSize: 10
      });
      return dispatch('fetchIdeas');
    }
  }
};

export default ideasModule;
