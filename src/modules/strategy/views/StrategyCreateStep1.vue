<template>
  <div class="strategy-create-step1">
    <div class="mb-6">
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">
        Basic Information
      </h2>
      <p class="text-gray-600">
        Tell us about your content strategy
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Strategy Name -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
          Strategy Name *
        </label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., IT Company Content Strategy"
        />
      </div>

      <!-- Persona Type -->
      <div>
        <label for="personaType" class="block text-sm font-medium text-gray-700 mb-2">
          Persona Type *
        </label>
        <select
          id="personaType"
          v-model="formData.personaType"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select persona type</option>
          <option value="expert">Expert</option>
          <option value="mentor">Mentor</option>
          <option value="friend">Friend</option>
          <option value="teacher">Teacher</option>
          <option value="inspirer">Inspirer</option>
        </select>
      </div>

      <!-- Target Audience -->
      <div>
        <label for="targetAudience" class="block text-sm font-medium text-gray-700 mb-2">
          Target Audience *
        </label>
        <textarea
          id="targetAudience"
          v-model="formData.targetAudience"
          required
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe your target audience..."
        ></textarea>
      </div>

      <!-- Languages -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Content Languages
        </label>
        <v-select
          v-model="formData.languagesArray"
          :items="languageItems"
          item-title="label"
          item-value="code"
          multiple
          chips
          closable-chips
          clearable
          placeholder="Select languages"
          class="w-full"
        >
          <template v-slot:selection="{ item, index }">
            <v-chip
              v-if="index < 2"
              :key="item.raw.code"
              size="small"
              closable
              @click:close="removeLanguage(item.raw.code)"
            >
              {{ item.raw.label }}
            </v-chip>
            <span
              v-if="index === 2"
              class="text-grey text-caption align-self-center"
            >
              (+{{ formData.languagesArray.length - 2 }} others)
            </span>
          </template>
        </v-select>
        <p class="text-sm text-gray-500 mt-1">
          Select the languages for your content
        </p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from 'vue';
import { useStore } from 'vuex';
import { languages } from '../api/languages';

const store = useStore();

const formData = reactive({
  name: '',
  personaType: '',
  targetAudience: '',
  languagesArray: [] as string[]
});

// Convert languages to v-select format
const languageItems = computed(() => 
  languages.map(lang => ({
    code: lang.code,
    label: `${lang.name} (${lang.nativeName})`,
    title: lang.name,
    subtitle: lang.nativeName
  }))
);

const removeLanguage = (code: string) => {
  const index = formData.languagesArray.indexOf(code);
  if (index > -1) {
    formData.languagesArray.splice(index, 1);
  }
};

// Watch for changes and update store
watch(formData, (newData) => {
  store.commit('strategy/SET_CREATION_DATA', {
    step1: { ...newData }
  });
}, { deep: true });

// Load existing data from store
const existingData = store.getters['strategy/creationData'].step1;
if (existingData) {
  Object.assign(formData, existingData);
}

const handleSubmit = () => {
  // Validation is handled by required attributes
  store.commit('strategy/SET_CREATION_DATA', {
    step1: { ...formData }
  });
};
</script>

