import { Module } from 'vuex';
import { ideasService, Idea, IdeaFilters } from '../api/ideas.service';

export interface IdeasStatusCounts {
  total: number;
  new: number;
  planned: number;
  readyToPublish: number;
  published: number;
}

export interface SessionGroup {
  sessionId: string | null;
  sessionTitle: string;
  ideas: Idea[];
}

export interface IdeasState {
  ideas: Idea[];
  currentIdea: Idea | null;
  totalIdeas: number;
  newIdeas: number;
  statusCounts: IdeasStatusCounts;
  loading: boolean;
  backgroundLoading: boolean;
  error: string | null;
  filters: IdeaFilters;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
}

const getDefaultState = (): IdeasState => ({
  ideas: [],
  currentIdea: null,
  totalIdeas: 0,
  newIdeas: 0,
  statusCounts: {
    total: 0,
    new: 0,
    planned: 0,
    readyToPublish: 0,
    published: 0
  },
  loading: false,
  backgroundLoading: false,
  error: null,
  filters: {
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    pageSize: 12
  },
  pagination: {
    page: 1,
    pageSize: 12,
    total: 0,
    pageCount: 0
  }
});

const ideasModule: Module<IdeasState, any> = {
  namespaced: true,
  
  state: getDefaultState,
  
  getters: {
    allIdeas: (state): Idea[] => state.ideas,
    currentIdea: (state): Idea | null => state.currentIdea,
    recentIdeas: (state): Idea[] => state.ideas.slice(0, 5),
    totalIdeas: (state): number => state.totalIdeas,
    newIdeas: (state): number => state.newIdeas,
    statusCounts: (state): IdeasStatusCounts => state.statusCounts,
    isLoading: (state): boolean => state.loading,
    isBackgroundLoading: (state): boolean => state.backgroundLoading,
    filters: (state): IdeaFilters => state.filters,
    pagination: (state): any => state.pagination,
    
    /**
     * Groups ideas by their session for swimlane view
     * Returns an array of SessionGroup objects with ideas grouped by session
     * Orphan ideas (no session) are grouped under "Uncategorized"
     * Sessions are sorted by the newest idea's createdAt (newest first)
     */
    ideasGroupedBySession: (state): SessionGroup[] => {
      const grouped = new Map<string | null, SessionGroup>();
      
      for (const idea of state.ideas) {
        const sessionId = idea.session?.documentId ?? null;
        const sessionTitle = idea.session?.title ?? 'Uncategorized';
        
        if (!grouped.has(sessionId)) {
          grouped.set(sessionId, { sessionId, sessionTitle, ideas: [] });
        }
        grouped.get(sessionId)!.ideas.push(idea);
      }
      
      // Sort: sessions by newest idea's createdAt (newest first), uncategorized last
      return Array.from(grouped.values()).sort((a, b) => {
        // Uncategorized always last
        if (!a.sessionId) return 1;
        if (!b.sessionId) return -1;
        
        // Get the newest idea's date from each group (ideas are already sorted by createdAt desc)
        const aNewestDate = a.ideas[0]?.createdAt || '';
        const bNewestDate = b.ideas[0]?.createdAt || '';
        
        // Sort descending (newest first)
        return bNewestDate.localeCompare(aNewestDate);
      });
    }
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
    
    SET_STATUS_COUNTS(state, counts: IdeasStatusCounts) {
      state.statusCounts = counts;
    },
    
    SET_LOADING(state, loading: boolean) {
      state.loading = loading;
    },
    
    SET_BACKGROUND_LOADING(state, loading: boolean) {
      state.backgroundLoading = loading;
    },
    
    SET_ERROR(state, error: string | null) {
      state.error = error;
    },
    
    SET_FILTERS(state, filters: Partial<IdeaFilters>) {
      state.filters = { ...state.filters, ...filters };
    },
    
    SET_PAGINATION(state, pagination: any) {
      state.pagination = pagination;
    },

    RESET_STATE(state) {
      Object.assign(state, getDefaultState());
    }
  },
  
  actions: {
    async fetchIdeas({ commit, state }) {
      if (state.ideas.length > 0) {
        commit('SET_BACKGROUND_LOADING', true);
      } else {
        commit('SET_LOADING', true);
      }
      commit('SET_ERROR', null);
      
      try {
        const response = await ideasService.getIdeas(state.filters);
        
        commit('SET_IDEAS', response.data);
        commit('SET_PAGINATION', response.meta.pagination);
        
        // Use pagination total instead of separate count requests
        commit('SET_TOTAL_IDEAS', response.meta.pagination.total);
        
        return response;
      } catch (error: any) {
        console.error('Error fetching ideas:', error);
        commit('SET_ERROR', error.message || 'Failed to fetch ideas');
        throw error;
      } finally {
        commit('SET_LOADING', false);
        commit('SET_BACKGROUND_LOADING', false);
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
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page: 1,
        pageSize: 12
      });
      return dispatch('fetchIdeas');
    },
    
    async fetchStatusCounts({ commit }) {
      try {
        const counts = await ideasService.countIdeasByStatus();
        commit('SET_STATUS_COUNTS', counts);
        return counts;
      } catch (error: any) {
        console.error('Error fetching status counts:', error);
        throw error;
      }
    }
  }
};

export default ideasModule;
