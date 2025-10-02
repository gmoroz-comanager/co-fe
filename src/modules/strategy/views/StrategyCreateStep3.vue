<template>
  <div class="strategy-create-step3">
    <div class="mb-6">
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">
        Lexicon and Values
      </h2>
      <p class="text-gray-600">
        Define your brand's vocabulary and principles
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Preferred Lexicon -->
      <div>
        <label for="lexiconPreferred" class="block text-sm font-medium text-gray-700 mb-2">
          Preferred Words and Expressions *
        </label>
        <textarea
          id="lexiconPreferred"
          v-model="formData.lexiconPreferred"
          required
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Words and phrases that should be used in content..."
        ></textarea>
        <p class="text-sm text-gray-500 mt-1">
          e.g., innovation, quality, reliability, efficiency
        </p>
      </div>

      <!-- Avoid Lexicon -->
      <div>
        <label for="lexiconAvoid" class="block text-sm font-medium text-gray-700 mb-2">
          Words and Expressions to Avoid
        </label>
        <textarea
          id="lexiconAvoid"
          v-model="formData.lexiconAvoid"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Words and phrases that should not be used..."
        ></textarea>
        <p class="text-sm text-gray-500 mt-1">
          e.g., cheap, bad, unsuccessful
        </p>
      </div>

      <!-- Core Values -->
      <div>
        <label for="coreValues" class="block text-sm font-medium text-gray-700 mb-2">
          Core Brand Values *
        </label>
        <textarea
          id="coreValues"
          v-model="formData.coreValues"
          required
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe your brand's core values and principles..."
        ></textarea>
        <p class="text-sm text-gray-500 mt-1">
          e.g., honesty, transparency, innovation, customer care
        </p>
      </div>

      <!-- Topics to Avoid -->
      <div>
        <label for="avoidTopics" class="block text-sm font-medium text-gray-700 mb-2">
          Topics to Avoid
        </label>
        <textarea
          id="avoidTopics"
          v-model="formData.avoidTopics"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Topics that should not be covered in content..."
        ></textarea>
        <p class="text-sm text-gray-500 mt-1">
          e.g., politics, religion, controversial topics
        </p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const formData = reactive({
  lexiconPreferred: '',
  lexiconAvoid: '',
  coreValues: '',
  avoidTopics: ''
});

// Watch for changes and update store
watch(formData, (newData) => {
  store.commit('strategy/SET_CREATION_DATA', {
    step3: { ...newData }
  });
}, { deep: true });

// Load existing data from store
const existingData = store.getters['strategy/creationData'].step3;
if (existingData) {
  Object.assign(formData, existingData);
}

const handleSubmit = () => {
  store.commit('strategy/SET_CREATION_DATA', {
    step3: { ...formData }
  });
};
</script>

