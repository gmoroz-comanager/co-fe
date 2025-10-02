<template>
  <div class="strategy-create-step2">
    <div class="mb-6">
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">
        Tone and Communication Style
      </h2>
      <p class="text-gray-600">
        Define how you want to communicate with your audience
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Tone Type -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-3">
          Tone Type *
        </label>
        <div class="grid grid-cols-2 gap-4">
          <label class="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50" :class="{ 'border-blue-500 bg-blue-50': formData.toneType === 'calm' }">
            <input
              v-model="formData.toneType"
              type="radio"
              value="calm"
              class="sr-only"
            />
            <div class="flex-1">
              <div class="font-medium text-gray-900">Calm</div>
              <div class="text-sm text-gray-500">Soft, relaxed tone</div>
            </div>
          </label>
          <label class="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50" :class="{ 'border-blue-500 bg-blue-50': formData.toneType === 'agressive' }">
            <input
              v-model="formData.toneType"
              type="radio"
              value="agressive"
              class="sr-only"
            />
            <div class="flex-1">
              <div class="font-medium text-gray-900">Aggressive</div>
              <div class="text-sm text-gray-500">Energetic, assertive tone</div>
            </div>
          </label>
        </div>
      </div>

      <!-- Formality -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-3">
          Formality Level *
        </label>
        <div class="grid grid-cols-3 gap-4">
          <label class="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50" :class="{ 'border-blue-500 bg-blue-50': formData.formality === 'casual' }">
            <input
              v-model="formData.formality"
              type="radio"
              value="casual"
              class="sr-only"
            />
            <div class="flex-1 text-center">
              <div class="font-medium text-gray-900">Casual</div>
              <div class="text-sm text-gray-500">Friendly, simple</div>
            </div>
          </label>
          <label class="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50" :class="{ 'border-blue-500 bg-blue-50': formData.formality === 'professional' }">
            <input
              v-model="formData.formality"
              type="radio"
              value="professional"
              class="sr-only"
            />
            <div class="flex-1 text-center">
              <div class="font-medium text-gray-900">Professional</div>
              <div class="text-sm text-gray-500">Business-like, serious</div>
            </div>
          </label>
          <label class="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50" :class="{ 'border-blue-500 bg-blue-50': formData.formality === 'humorous' }">
            <input
              v-model="formData.formality"
              type="radio"
              value="humorous"
              class="sr-only"
            />
            <div class="flex-1 text-center">
              <div class="font-medium text-gray-900">Humorous</div>
              <div class="text-sm text-gray-500">With humor, light</div>
            </div>
          </label>
        </div>
      </div>

      <!-- Sentence Length -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-3">
          Sentence Length *
        </label>
        <div class="grid grid-cols-3 gap-4">
          <label class="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50" :class="{ 'border-blue-500 bg-blue-50': formData.sentenceLength === 'short' }">
            <input
              v-model="formData.sentenceLength"
              type="radio"
              value="short"
              class="sr-only"
            />
            <div class="flex-1 text-center">
              <div class="font-medium text-gray-900">Short</div>
              <div class="text-sm text-gray-500">Concise, to the point</div>
            </div>
          </label>
          <label class="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50" :class="{ 'border-blue-500 bg-blue-50': formData.sentenceLength === 'medium' }">
            <input
              v-model="formData.sentenceLength"
              type="radio"
              value="medium"
              class="sr-only"
            />
            <div class="flex-1 text-center">
              <div class="font-medium text-gray-900">Medium</div>
              <div class="text-sm text-gray-500">Balanced</div>
            </div>
          </label>
          <label class="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50" :class="{ 'border-blue-500 bg-blue-50': formData.sentenceLength === 'long' }">
            <input
              v-model="formData.sentenceLength"
              type="radio"
              value="long"
              class="sr-only"
            />
            <div class="flex-1 text-center">
              <div class="font-medium text-gray-900">Long</div>
              <div class="text-sm text-gray-500">Detailed, extensive</div>
            </div>
          </label>
        </div>
      </div>

      <!-- Humor Amount -->
      <div>
        <label for="humorAmount" class="block text-sm font-medium text-gray-700 mb-2">
          Humor Amount (0-10)
        </label>
        <div class="flex items-center space-x-4">
          <input
            id="humorAmount"
            v-model.number="formData.humorAmount"
            type="range"
            min="0"
            max="10"
            class="flex-1"
          />
          <span class="text-lg font-medium text-gray-900 w-8">{{ formData.humorAmount }}</span>
        </div>
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>Serious</span>
          <span>Very Funny</span>
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
  toneType: '' as 'calm' | 'agressive' | '',
  formality: '' as 'casual' | 'professional' | 'humorous' | '',
  sentenceLength: '' as 'short' | 'medium' | 'long' | '',
  humorAmount: 5
});

// Watch for changes and update store
watch(formData, (newData) => {
  store.commit('strategy/SET_CREATION_DATA', {
    step2: { ...newData }
  });
}, { deep: true });

// Load existing data from store
const existingData = store.getters['strategy/creationData'].step2;
if (existingData) {
  Object.assign(formData, existingData);
}

const handleSubmit = () => {
  store.commit('strategy/SET_CREATION_DATA', {
    step2: { ...formData }
  });
};
</script>

