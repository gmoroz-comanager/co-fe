import { Module } from 'vuex';
import {
  sessionsService,
  Session,
  SessionFilters,
  ProcessingStatus,
  CreateSessionData,
  UpdateSessionData,
} from '../api/sessions.service';

export interface PaginationMeta {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface SessionsState {
  sessions: Session[];
  currentSession: Session | null;
  processingStatus: ProcessingStatus | null;
  filters: SessionFilters;
  pagination: PaginationMeta;
  loading: boolean;
  error: string | null;
  pollingInterval: number | null;
}

const sessionsModule: Module<SessionsState, any> = {
  namespaced: true,

  state: () => ({
    sessions: [],
    currentSession: null,
    processingStatus: null,
    filters: {},
    pagination: {
      page: 1,
      pageSize: 10,
      pageCount: 1,
      total: 0,
    },
    loading: false,
    error: null,
    pollingInterval: null,
  }),

  getters: {
    sessions: (state) => state.sessions,
    currentSession: (state) => state.currentSession,
    processingStatus: (state) => state.processingStatus,
    filters: (state) => state.filters,
    pagination: (state) => state.pagination,
    isLoading: (state) => state.loading,
    error: (state) => state.error,

    // Derived getters
    draftSessions: (state) => state.sessions.filter((s) => s.work_status === 'draft'),
    processingSessions: (state) => state.sessions.filter((s) => s.work_status === 'processing'),
    readySessions: (state) => state.sessions.filter((s) => s.work_status === 'ready'),

    // Current session derived data
    currentSessionSources: (state) => state.currentSession?.audio_sources || [],
    currentSessionIdeas: (state) => state.currentSession?.ideas || [],
    currentSessionParticipants: (state) => state.currentSession?.participants || [],
    currentSessionNarratives: (state) => state.currentSession?.narratives || [],

    // Processing progress
    processingProgress: (state) => {
      if (!state.processingStatus) return null;
      const { statusCounts, totalSources } = state.processingStatus;
      const completed = statusCounts.summarized + statusCounts.processed;
      return {
        percent: totalSources > 0 ? Math.round((completed / totalSources) * 100) : 0,
        transcribing: statusCounts.transcribing,
        summarizing: statusCounts.summarizing,
        completed,
        failed: statusCounts.failed,
        total: totalSources,
      };
    },
  },

  mutations: {
    SET_SESSIONS(state, sessions: Session[]) {
      state.sessions = sessions;
    },

    SET_CURRENT_SESSION(state, session: Session | null) {
      state.currentSession = session;
    },

    SET_PROCESSING_STATUS(state, status: ProcessingStatus | null) {
      state.processingStatus = status;
    },

    SET_FILTERS(state, filters: SessionFilters) {
      state.filters = filters;
    },

    SET_PAGINATION(state, pagination: PaginationMeta) {
      state.pagination = pagination;
    },

    SET_LOADING(state, loading: boolean) {
      state.loading = loading;
    },

    SET_ERROR(state, error: string | null) {
      state.error = error;
    },

    SET_POLLING_INTERVAL(state, interval: number | null) {
      state.pollingInterval = interval;
    },

    UPDATE_SESSION_IN_LIST(state, updatedSession: Session) {
      const index = state.sessions.findIndex((s) => s.documentId === updatedSession.documentId);
      if (index !== -1) {
        state.sessions.splice(index, 1, updatedSession);
      }
    },

    ADD_SESSION(state, session: Session) {
      state.sessions.unshift(session);
    },

    REMOVE_SESSION(state, documentId: string) {
      state.sessions = state.sessions.filter((s) => s.documentId !== documentId);
    },
  },

  actions: {
    /**
     * Fetch all sessions
     */
    async fetchSessions({ commit, state }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      try {
        const response = await sessionsService.getSessions(state.filters);
        commit('SET_SESSIONS', response.data);
        if (response.meta?.pagination) {
          commit('SET_PAGINATION', response.meta.pagination);
        }
      } catch (error: any) {
        commit('SET_ERROR', error.message || 'Failed to fetch sessions');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    /**
     * Fetch a single session
     */
    async fetchSession({ commit }, documentId: string) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      try {
        const response = await sessionsService.getSession(documentId);
        commit('SET_CURRENT_SESSION', response.data);
        return response.data;
      } catch (error: any) {
        commit('SET_ERROR', error.message || 'Failed to fetch session');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    /**
     * Create a new session
     */
    async createSession({ commit }, data: CreateSessionData) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      try {
        const response = await sessionsService.createSession(data);
        commit('ADD_SESSION', response.data);
        return response.data;
      } catch (error: any) {
        commit('SET_ERROR', error.message || 'Failed to create session');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    /**
     * Update a session
     */
    async updateSession({ commit }, { documentId, data }: { documentId: string; data: UpdateSessionData }) {
      commit('SET_ERROR', null);

      try {
        const response = await sessionsService.updateSession(documentId, data);
        commit('UPDATE_SESSION_IN_LIST', response.data);
        if (response.data) {
          commit('SET_CURRENT_SESSION', response.data);
        }
        return response.data;
      } catch (error: any) {
        commit('SET_ERROR', error.message || 'Failed to update session');
        throw error;
      }
    },

    /**
     * Delete a session
     */
    async deleteSession({ commit }, documentId: string) {
      commit('SET_ERROR', null);

      try {
        await sessionsService.deleteSession(documentId);
        commit('REMOVE_SESSION', documentId);
      } catch (error: any) {
        commit('SET_ERROR', error.message || 'Failed to delete session');
        throw error;
      }
    },

    /**
     * Start processing a session
     */
    async processSession({ commit, dispatch }, documentId: string) {
      commit('SET_ERROR', null);

      try {
        const result = await sessionsService.processSession(documentId);
        // Start polling for status updates
        dispatch('startStatusPolling', documentId);
        return result;
      } catch (error: any) {
        commit('SET_ERROR', error.message || 'Failed to start processing');
        throw error;
      }
    },

    /**
     * Generate ideas from selected audio sources
     */
    async generateIdeas({ commit }, { documentId, audioSourceIds }: { documentId: string; audioSourceIds: string[] }) {
      commit('SET_ERROR', null);

      try {
        const result = await sessionsService.generateIdeas(documentId, audioSourceIds);
        return result;
      } catch (error: any) {
        commit('SET_ERROR', error.message || 'Failed to generate ideas');
        throw error;
      }
    },

    /**
     * Fetch processing status
     */
    async fetchProcessingStatus({ commit }, documentId: string) {
      try {
        const status = await sessionsService.getProcessingStatus(documentId);
        commit('SET_PROCESSING_STATUS', status);
        return status;
      } catch (error: any) {
        console.error('Error fetching processing status:', error);
        throw error;
      }
    },

    /**
     * Start polling for status updates
     */
    startStatusPolling({ commit, dispatch, state }, documentId: string) {
      // Clear existing interval
      if (state.pollingInterval) {
        clearInterval(state.pollingInterval);
      }

      // Poll every 3 seconds
      const interval = window.setInterval(async () => {
        try {
          const status = await sessionsService.getProcessingStatus(documentId);
          commit('SET_PROCESSING_STATUS', status);

          // Stop polling if session is ready or has error
          if (status.sessionStatus === 'ready' || status.sessionStatus === 'error') {
            dispatch('stopStatusPolling');
            // Refresh session data
            dispatch('fetchSession', documentId);
          }
        } catch (error) {
          console.error('Error polling status:', error);
        }
      }, 3000);

      commit('SET_POLLING_INTERVAL', interval);
    },

    /**
     * Stop status polling
     */
    stopStatusPolling({ commit, state }) {
      if (state.pollingInterval) {
        clearInterval(state.pollingInterval);
        commit('SET_POLLING_INTERVAL', null);
      }
    },

    /**
     * Set filters and refetch (resets to page 1)
     */
    async setFilters({ commit, dispatch }, filters: SessionFilters) {
      // Reset to page 1 when filters change
      commit('SET_FILTERS', { ...filters, page: 1 });
      await dispatch('fetchSessions');
    },

    /**
     * Set page and refetch
     */
    async setPage({ commit, dispatch, state }, page: number) {
      commit('SET_FILTERS', { ...state.filters, page });
      await dispatch('fetchSessions');
    },

    /**
     * Clear current session
     */
    clearCurrentSession({ commit }) {
      commit('SET_CURRENT_SESSION', null);
      commit('SET_PROCESSING_STATUS', null);
    },

    /**
     * Add audio source to current session
     */
    async addAudioSource({ commit, state, dispatch }, audioSourceData: any) {
      if (!state.currentSession) {
        throw new Error('No current session');
      }

      commit('SET_ERROR', null);

      try {
        await sessionsService.addAudioSource(state.currentSession.documentId, audioSourceData);
        // Refresh current session
        await dispatch('fetchSession', state.currentSession.documentId);
      } catch (error: any) {
        commit('SET_ERROR', error.message || 'Failed to add audio source');
        throw error;
      }
    },

    /**
     * Upload files for session
     */
    async uploadFiles(_, { files, onUploadProgress }: { files: File[]; onUploadProgress?: (e: any) => void }) {
      return sessionsService.uploadFiles(files, onUploadProgress);
    },
  },
};

export default sessionsModule;

