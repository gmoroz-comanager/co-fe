<template>
  <div class="strategy-create-step3">
    <div class="mb-6">
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">
        Лексика и ценности
      </h2>
      <p class="text-gray-600">
        Определите словарь и принципы вашего бренда
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Preferred Lexicon -->
      <div>
        <label for="lexiconPreferred" class="block text-sm font-medium text-gray-700 mb-2">
          Предпочитаемые слова и выражения *
        </label>
        <textarea
          id="lexiconPreferred"
          v-model="formData.lexiconPreferred"
          required
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Слова и фразы, которые должны использоваться в контенте..."
        ></textarea>
        <p class="text-sm text-gray-500 mt-1">
          Например: инновации, качество, надежность, эффективность
        </p>
      </div>

      <!-- Avoid Lexicon -->
      <div>
        <label for="lexiconAvoid" class="block text-sm font-medium text-gray-700 mb-2">
          Слова и выражения, которых следует избегать
        </label>
        <textarea
          id="lexiconAvoid"
          v-model="formData.lexiconAvoid"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Слова и фразы, которые не должны использоваться..."
        ></textarea>
        <p class="text-sm text-gray-500 mt-1">
          Например: дешевый, плохой, неудачный
        </p>
      </div>

      <!-- Core Values -->
      <div>
        <label for="coreValues" class="block text-sm font-medium text-gray-700 mb-2">
          Основные ценности бренда *
        </label>
        <textarea
          id="coreValues"
          v-model="formData.coreValues"
          required
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Опишите основные ценности и принципы вашего бренда..."
        ></textarea>
        <p class="text-sm text-gray-500 mt-1">
          Например: честность, прозрачность, инновации, забота о клиентах
        </p>
      </div>

      <!-- Topics to Avoid -->
      <div>
        <label for="avoidTopics" class="block text-sm font-medium text-gray-700 mb-2">
          Темы, которых следует избегать
        </label>
        <textarea
          id="avoidTopics"
          v-model="formData.avoidTopics"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Темы, которые не должны освещаться в контенте..."
        ></textarea>
        <p class="text-sm text-gray-500 mt-1">
          Например: политика, религия, спорные темы
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

