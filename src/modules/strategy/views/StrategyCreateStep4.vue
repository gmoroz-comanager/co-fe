<template>
  <div class="strategy-create-step4">
    <div class="mb-6">
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">
        Settings and Goals
      </h2>
      <p class="text-gray-600">
        Final parameters and goals for your strategy
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Target Post Count -->
      <div>
        <label for="targetPostCount" class="block text-sm font-medium text-gray-700 mb-2">
          Target Number of Posts per Month *
        </label>
        <input
          id="targetPostCount"
          v-model.number="formData.targetPostCount"
          type="number"
          min="1"
          max="100"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., 30"
        />
      </div>

      <!-- Social Media Channels -->
      <div>
        <label for="smmChannelsArray" class="block text-sm font-medium text-gray-700 mb-2">
          Social Media Channels
        </label>
        <input
          id="smmChannelsArray"
          v-model="formData.smmChannelsArray"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Instagram, Facebook, LinkedIn, YouTube"
        />
        <p class="text-sm text-gray-500 mt-1">
          Specify channels separated by commas
        </p>
      </div>

      <!-- Call to Action Formats -->
      <div>
        <label for="callToActionFormatsArray" class="block text-sm font-medium text-gray-700 mb-2">
          Call to Action Formats
        </label>
        <textarea
          id="callToActionFormatsArray"
          v-model="formData.callToActionFormatsArray"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., 'Learn More', 'Download', 'Subscribe', 'Contact Us'"
        ></textarea>
      </div>

      <!-- Main Goals -->
      <div>
        <label for="mainGoalsArray" class="block text-sm font-medium text-gray-700 mb-2">
          Main Strategy Goals *
        </label>
        <textarea
          id="mainGoalsArray"
          v-model="formData.mainGoalsArray"
          required
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe the main goals of your content strategy..."
        ></textarea>
        <p class="text-sm text-gray-500 mt-1">
          e.g., increase brand awareness, attract new customers, improve loyalty
        </p>
      </div>

      <!-- User Examples -->
      <div>
        <label for="userExamples" class="block text-sm font-medium text-gray-700 mb-2">
          User Content Examples
        </label>
        <textarea
          id="userExamples"
          v-model="formData.userExamples"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Examples of posts you like or want to use as templates..."
        ></textarea>
      </div>

      <!-- Additional Settings -->
      <div class="grid grid-cols-3 gap-4">
        <div class="flex items-center">
          <input
            id="useEmodji"
            v-model="formData.useEmodji"
            type="checkbox"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label for="useEmodji" class="ml-2 block text-sm text-gray-900">
            Use Emojis
          </label>
        </div>

        <div class="flex items-center">
          <input
            id="useAudienceQuestions"
            v-model="formData.useAudienceQuestions"
            type="checkbox"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label for="useAudienceQuestions" class="ml-2 block text-sm text-gray-900">
            Ask Audience Questions
          </label>
        </div>

        <div class="flex items-center">
          <input
            id="useSlang"
            v-model="formData.useSlang"
            type="checkbox"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label for="useSlang" class="ml-2 block text-sm text-gray-900">
            Use Slang
          </label>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const formData = reactive({
  targetPostCount: 0,
  callToActionFormatsArray: '',
  smmChannelsArray: '',
  userExamples: '',
  mainGoalsArray: '',
  useEmodji: false,
  useAudienceQuestions: false,
  useSlang: false
});

// Watch for changes and update store
watch(formData, (newData) => {
  store.commit('strategy/SET_CREATION_DATA', {
    step4: { ...newData }
  });
}, { deep: true });

// Load existing data from store
const existingData = store.getters['strategy/creationData'].step4;
if (existingData) {
  Object.assign(formData, existingData);
}

const handleSubmit = () => {
  store.commit('strategy/SET_CREATION_DATA', {
    step4: { ...formData }
  });
};
</script>

