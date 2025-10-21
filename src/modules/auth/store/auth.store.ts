import { Module } from 'vuex';
import { authService } from '../api';

export interface User {
  id: number;
  username: string;
  email: string;
  linkedinUrl?: string;
  finishedOnboardingStage1?: boolean;
  onboardingComplete?: boolean;
  smartProfileEmbeded?: {
    externalProfileAnalytics?: any;
  };
  [key: string]: any;
}

export interface AuthState {
  token: string;
  user: User | Record<string, never>;
  loading: boolean;
  error: string | null;
}

const authModule: Module<AuthState, any> = {
  namespaced: true,
  
  state: (): AuthState => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || '{}'),
    loading: false,
    error: null
  }),
  
  getters: {
    isLoggedIn: (state): boolean => !!state.token,
    currentUser: (state): User | Record<string, never> => state.user,
    isLoading: (state): boolean => state.loading,
    error: (state): string | null => state.error
  },
  
  mutations: {
    SET_LOADING(state, loading: boolean) {
      state.loading = loading;
    },
    
    SET_ERROR(state, error: string | null) {
      state.error = error;
    },
    
    AUTH_SUCCESS(state, { token, user }: { token: string; user: User }) {
      state.token = token;
      state.user = user;
    },
    
    UPDATE_USER(state, user: User) {
      state.user = user;
    },
    
    LOGOUT(state) {
      state.token = '';
      state.user = {};
    }
  },
  
  actions: {
    async login({ commit }, credentials: { email: string; password: string }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const response = await authService.login(credentials);
        commit('AUTH_SUCCESS', {
          token: response.jwt,
          user: response.user
        });
        return response;
      } catch (error: any) {
        commit('SET_ERROR', error.response?.data?.error?.message || 'Login failed');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async register({ commit }, userData: { username: string; email: string; password: string; linkedinUrl: string }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const response = await authService.register(userData);
        commit('AUTH_SUCCESS', {
          token: response.jwt,
          user: response.user
        });
        return response;
      } catch (error: any) {
        commit('SET_ERROR', error.response?.data?.error?.message || 'Registration failed');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    logout({ commit }) {
      authService.logout();
      commit('LOGOUT');
    },
    
    checkAuth({ commit }) {
      if (authService.isAuthenticated()) {
        const user = authService.getCurrentUser();
        const token = localStorage.getItem('token') || '';
        
        if (user && token) {
          commit('AUTH_SUCCESS', { token, user });
        }
      }
    },
    
    async refreshUser({ commit }) {
      try {
        const user = await authService.fetchCurrentUser();
        commit('UPDATE_USER', user);
        return user;
      } catch (error) {
        console.error('Failed to refresh user data:', error);
        throw error;
      }
    }
  }
};

export default authModule;
