<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-h4">Brand Profile</h1>
        <p class="text-subtitle-1">Manage your brand's voice, tone, and strategy.</p>
      </v-col>
    </v-row>

    <v-card v-if="!isLoading" class="mt-4">
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <!-- Brand Identity Section -->
          <h2 class="text-h5 mb-4">Brand Identity</h2>
          <v-text-field v-model="editableProfile.identity" label="Identity"></v-text-field>
          <v-combobox
            v-model="editableProfile.values"
            label="Values"
            multiple
            chips
            deletable-chips
          ></v-combobox>
          <v-combobox
            v-model="editableProfile.tone"
            label="Tone of Voice"
            multiple
            chips
            deletable-chips
          ></v-combobox>
          <v-slider v-model="editableProfile.humorLevel" label="Humor Level" thumb-label min="0" max="10"></v-slider>
          <v-text-field v-model="editableProfile.targetLanguage" label="Target Language"></v-text-field>
          <v-combobox v-model="editableProfile.values" label="Core Values" multiple chips closable-chips></v-combobox>

          <!-- Audience Section -->
          <h2 class="text-h5 mt-6 mb-4">Audience</h2>
          <v-combobox v-model="editableProfile.audience" label="Target Audience" multiple chips closable-chips></v-combobox>
          <v-combobox v-model="editableProfile.pains" label="Audience Pains" multiple chips closable-chips></v-combobox>
          <v-combobox v-model="editableProfile.goals" label="Audience Goals" multiple chips closable-chips></v-combobox>

          <!-- Lexicon Section -->
          <h2 class="text-h5 mt-6 mb-4">Lexicon</h2>
          <v-combobox v-model="editableProfile.styleLexicon" label="Preferred Lexicon" multiple chips closable-chips></v-combobox>
          <v-combobox v-model="editableProfile.avoidLexicon" label="Lexicon to Avoid" multiple chips closable-chips></v-combobox>
          
          <!-- Strategy Section -->
          <h2 class="text-h5 mt-6 mb-4">Strategy</h2>
          <v-combobox v-model="editableProfile.contentPillars" label="Content Pillars" multiple chips closable-chips></v-combobox>
          <v-combobox v-model="editableProfile.channelsPriority" label="Channel Priority" multiple chips closable-chips></v-combobox>
          <v-text-field v-model="editableProfile.cadence" label="Posting Cadence"></v-text-field>
          <v-combobox v-model="editableProfile.ctaStyles" label="Call-to-Action Styles" multiple chips closable-chips></v-combobox>
          <v-combobox v-model="editableProfile.tabooTopics" label="Taboo Topics" multiple chips closable-chips></v-combobox>

          <!-- Deliverables Section -->
          <h2 class="text-h5 mt-6 mb-4">Deliverables</h2>
          <v-combobox v-model="editableProfile.sampleHooks" label="Sample Hooks" multiple chips closable-chips></v-combobox>
          <v-combobox v-model="editableProfile.sampleCTAs" label="Sample CTAs" multiple chips closable-chips></v-combobox>
          <v-combobox v-model="editableProfile.postAngles" label="Post Angles" multiple chips closable-chips></v-combobox>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="saveProfile" :disabled="!valid">Save Changes</v-btn>
      </v-card-actions>
    </v-card>
    <v-row v-else class="mt-4">
      <v-col class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { BrandProfile } from '../api/brand-profile.types';

export default defineComponent({
  name: 'BrandProfile',
  setup() {
    const store = useStore();
    const valid = ref(true);
    const editableProfile = ref<Partial<BrandProfile>>({});

    const isLoading = computed(() => store.getters['brandProfile/isLoading']);
    const brandProfile = computed(() => store.getters['brandProfile/brandProfile']);

    onMounted(() => {
      store.dispatch('brandProfile/fetchBrandProfile');
    });

    watch(brandProfile, (newProfile) => {
      if (newProfile) {
        editableProfile.value = { ...newProfile };
      }
    }, { immediate: true });

    const saveProfile = () => {
      store.dispatch('brandProfile/saveBrandProfile', editableProfile.value);
    };

    return {
      valid,
      editableProfile,
      isLoading,
      saveProfile,
    };
  },
});
</script>
