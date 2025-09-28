import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:1337/api';

interface IdeaAttributes {
  title: string;
  question?: string;
  body?: any; // Using 'any' for blocks content
  polishedBody?: any;
  tags?: string;
  work_status?: 'new' | 'readyToPublish' | 'published';
  createdAt: string;
  updatedAt: string;
  postMedia?: {
    data: {
      id: number;
      attributes: {
        name: string;
        url: string;
        mime: string;
        size: number;
      }
    } | null;
  };
  audio_source?: {
    data: {
      id: number;
      attributes: any;
    } | null;
  };
}

interface Idea {
  id: number;
  attributes: IdeaAttributes;
}

interface IdeasState {
  ideas: Idea[];
  totalIdeas: number;
  newIdeas: number;
  loading: boolean;
  error: string | null;
}

export default {
  namespaced: true,
  
  state: (): IdeasState => ({
    ideas: [],
    totalIdeas: 0,
    newIdeas: 0,
    loading: false,
    error: null
  }),
  
  getters: {
    allIdeas: (state: IdeasState) => state.ideas,
    recentIdeas: (state: IdeasState) => state.ideas.slice(0, 3),
    totalIdeas: (state: IdeasState) => state.totalIdeas,
    newIdeas: (state: IdeasState) => state.newIdeas,
    isLoading: (state: IdeasState) => state.loading
  },
  
  mutations: {
    SET_IDEAS(state: IdeasState, ideas: Idea[]) {
      state.ideas = ideas;
    },
    SET_TOTAL_IDEAS(state: IdeasState, total: number) {
      state.totalIdeas = total;
    },
    SET_NEW_IDEAS(state: IdeasState, count: number) {
      state.newIdeas = count;
    },
    SET_LOADING(state: IdeasState, loading: boolean) {
      state.loading = loading;
    },
    SET_ERROR(state: IdeasState, error: string | null) {
      state.error = error;
    }
  },
  
  actions: {
    async fetchIdeas({ commit }: { commit: Function }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const token = localStorage.getItem('token');
        
        // Fetch all ideas sorted by creation date (newest first)
        const response = await axios.get(`${API_URL}/ideas?populate=*&sort=createdAt:desc`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const ideas = response.data.data;
        commit('SET_IDEAS', ideas);
        commit('SET_TOTAL_IDEAS', ideas.length);
        
        // Count ideas with 'new' status
        const newIdeas = ideas.filter((idea: Idea) => 
          idea.attributes.work_status === 'new'
        ).length;
        
        commit('SET_NEW_IDEAS', newIdeas);
      } catch (error: any) {
        console.error('Error fetching ideas:', error);
        commit('SET_ERROR', error.message || 'Failed to fetch ideas');
      } finally {
        commit('SET_LOADING', false);
      }
    }
  }
};
