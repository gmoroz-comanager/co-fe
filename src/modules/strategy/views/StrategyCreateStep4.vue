<template>
  <div class="strategy-create-step4">
    <div class="mb-6">
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">
        Настройки и цели
      </h2>
      <p class="text-gray-600">
        Финальные параметры и цели вашей стратегии
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Target Post Count -->
      <div>
        <label for="targetPostCount" class="block text-sm font-medium text-gray-700 mb-2">
          Целевое количество постов в месяц *
        </label>
        <input
          id="targetPostCount"
          v-model.number="formData.targetPostCount"
          type="number"
          min="1"
          max="100"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Например: 30"
        />
      </div>

      <!-- Social Media Channels -->
      <div>
        <label for="smmChannelsArray" class="block text-sm font-medium text-gray-700 mb-2">
          Социальные сети и каналы
        </label>
        <input
          id="smmChannelsArray"
          v-model="formData.smmChannelsArray"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Например: Instagram, Facebook, LinkedIn, YouTube"
        />
        <p class="text-sm text-gray-500 mt-1">
          Укажите каналы через запятую
        </p>
      </div>

      <!-- Call to Action Formats -->
      <div>
        <label for="callToActionFormatsArray" class="block text-sm font-medium text-gray-700 mb-2">
          Форматы призывов к действию
        </label>
        <textarea
          id="callToActionFormatsArray"
          v-model="formData.callToActionFormatsArray"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Например: 'Узнать больше', 'Скачать', 'Подписаться', 'Связаться с нами'"
        ></textarea>
      </div>

      <!-- Main Goals -->
      <div>
        <label for="mainGoalsArray" class="block text-sm font-medium text-gray-700 mb-2">
          Основные цели стратегии *
        </label>
        <textarea
          id="mainGoalsArray"
          v-model="formData.mainGoalsArray"
          required
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Опишите основные цели вашей контент-стратегии..."
        ></textarea>
        <p class="text-sm text-gray-500 mt-1">
          Например: увеличение узнаваемости бренда, привлечение новых клиентов, повышение лояльности
        </p>
      </div>

      <!-- User Examples -->
      <div>
        <label for="userExamples" class="block text-sm font-medium text-gray-700 mb-2">
          Примеры контента от пользователей
        </label>
        <textarea
          id="userExamples"
          v-model="formData.userExamples"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Примеры постов, которые вам нравятся или которые вы хотите использовать как образец..."
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
            Использовать эмодзи
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
            Задавать вопросы аудитории
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
            Использовать сленг
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

