import { Module } from 'vuex';

// Define the state interface
export interface HomeState {
  // Add state properties here if needed
}

const homeModule: Module<HomeState, any> = {
  namespaced: true,
  state: () => ({}),
  getters: {},
  mutations: {},
  actions: {}
};

export default homeModule;

