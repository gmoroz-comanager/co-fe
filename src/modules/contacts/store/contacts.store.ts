import { Module } from 'vuex';
import { contactsService, Contact } from '../api/contacts.service';

export interface ContactsState {
  items: Contact[];
  currentItem: Contact | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
}

export const contactsModule: Module<ContactsState, any> = {
  namespaced: true,

  state: () => ({
    items: [],
    currentItem: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      pageSize: 25,
      total: 0,
      pageCount: 0
    }
  }),

  getters: {
    allItems: (state) => state.items,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    pagination: (state) => state.pagination
  },

  mutations: {
    SET_ITEMS(state, items: Contact[]) {
      state.items = items;
    },
    SET_CURRENT_ITEM(state, item: Contact) {
      state.currentItem = item;
    },
    ADD_ITEM(state, item: Contact) {
      state.items.unshift(item);
    },
    UPDATE_ITEM(state, updatedItem: Contact) {
      const index = state.items.findIndex(i => i.documentId === updatedItem.documentId);
      if (index !== -1) {
        state.items.splice(index, 1, updatedItem);
      }
      if (state.currentItem && state.currentItem.documentId === updatedItem.documentId) {
        state.currentItem = updatedItem;
      }
    },
    REMOVE_ITEM(state, documentId: string) {
      state.items = state.items.filter(i => i.documentId !== documentId);
    },
    SET_LOADING(state, status: boolean) {
      state.loading = status;
    },
    SET_ERROR(state, error: string | null) {
      state.error = error;
    },
    SET_PAGINATION(state, pagination) {
      state.pagination = pagination;
    }
  },

  actions: {
    async fetchContacts({ commit }, params = {}) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const response = await contactsService.getContacts(params);
        commit('SET_ITEMS', response.data);
        commit('SET_PAGINATION', response.meta.pagination);
        return response;
      } catch (error: any) {
        commit('SET_ERROR', error.message || 'Failed to fetch contacts');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async createContact({ commit }, data: Partial<Contact>) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const response = await contactsService.createContact(data);
        commit('ADD_ITEM', response.data);
        return response.data;
      } catch (error: any) {
        commit('SET_ERROR', error.message || 'Failed to create contact');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async updateContact({ commit }, { id, data }: { id: string; data: Partial<Contact> }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const response = await contactsService.updateContact(id, data);
        commit('UPDATE_ITEM', response.data);
        return response.data;
      } catch (error: any) {
        commit('SET_ERROR', error.message || 'Failed to update contact');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async deleteContact({ commit }, id: string) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        await contactsService.deleteContact(id);
        commit('REMOVE_ITEM', id);
      } catch (error: any) {
        commit('SET_ERROR', error.message || 'Failed to delete contact');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    }
  }
};

