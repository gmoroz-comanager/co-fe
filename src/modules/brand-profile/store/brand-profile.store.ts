import { Module } from 'vuex';
import { brandProfileService } from '../api/brand-profile.service';
import { BrandProfile } from '../api/brand-profile.types';
import authService from '@/modules/auth/api/auth.service';

export interface BrandProfileState {
  brandProfile: BrandProfile | null;
  isLoading: boolean;
  error: string | null;
}

const brandProfileModule: Module<BrandProfileState, any> = {
  namespaced: true,
  state: {
    brandProfile: null,
    isLoading: false,
    error: null,
  },
  mutations: {
    setBrandProfile(state, profile: BrandProfile) {
      state.brandProfile = profile;
    },
    setLoading(state, isLoading: boolean) {
      state.isLoading = isLoading;
    },
    setError(state, error: string | null) {
      state.error = error;
    },
  },
  actions: {
    async fetchBrandProfile({ commit }) {
      commit('setLoading', true);
      commit('setError', null);
      try {
        const profiles = await brandProfileService.getBrandProfile();
        
        if (profiles && profiles.length > 0) {
          commit('setBrandProfile', profiles[0]);
        } else {
          commit('setBrandProfile', null); // No profile found
        }
      } catch (error: any) {
        commit('setError', 'Failed to fetch brand profile.');
        commit('setBrandProfile', null); // Ensure profile is null on error
      } finally {
        commit('setLoading', false);
      }
    },
    async saveBrandProfile({ commit, dispatch }, profileData: Partial<BrandProfile>) {
      commit('setLoading', true);
      commit('setError', null);
      try {
        let savedProfile;
        
        if (profileData.documentId) {
          savedProfile = await brandProfileService.updateBrandProfile(profileData.documentId, profileData);
        } else {
          savedProfile = await brandProfileService.createBrandProfile(profileData);
        }
        commit('setBrandProfile', savedProfile);
      } catch (error) {
        commit('setError', 'Failed to save brand profile.');
      } finally {
        commit('setLoading', false);
      }
    },
  },
  getters: {
    brandProfile: (state) => state.brandProfile,
    isLoading: (state) => state.isLoading,
    error: (state) => state.error,
  },
};

export default brandProfileModule;
