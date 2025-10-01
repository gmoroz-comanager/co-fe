<template>
  <div class="strategy-create-step2">
    <div class="mb-6">
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">
        Тон и стиль коммуникации
      </h2>
      <p class="text-gray-600">
        Определите, как вы хотите общаться с аудиторией
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Tone Type -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-3">
          Тип тона *
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
              <div class="font-medium text-gray-900">Спокойный</div>
              <div class="text-sm text-gray-500">Мягкий, расслабленный тон</div>
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
              <div class="font-medium text-gray-900">Агрессивный</div>
              <div class="text-sm text-gray-500">Энергичный, напористый тон</div>
            </div>
          </label>
        </div>
      </div>

      <!-- Formality -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-3">
          Уровень формальности *
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
              <div class="font-medium text-gray-900">Неформальный</div>
              <div class="text-sm text-gray-500">Дружелюбно, просто</div>
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
              <div class="font-medium text-gray-900">Профессиональный</div>
              <div class="text-sm text-gray-500">Деловито, серьезно</div>
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
              <div class="font-medium text-gray-900">Юмористический</div>
              <div class="text-sm text-gray-500">С юмором, легко</div>
            </div>
          </label>
        </div>
      </div>

      <!-- Sentence Length -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-3">
          Длина предложений *
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
              <div class="font-medium text-gray-900">Короткие</div>
              <div class="text-sm text-gray-500">Лаконично, по делу</div>
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
              <div class="font-medium text-gray-900">Средние</div>
              <div class="text-sm text-gray-500">Сбалансированно</div>
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
              <div class="font-medium text-gray-900">Длинные</div>
              <div class="text-sm text-gray-500">Подробно, развернуто</div>
            </div>
          </label>
        </div>
      </div>

      <!-- Humor Amount -->
      <div>
        <label for="humorAmount" class="block text-sm font-medium text-gray-700 mb-2">
          Количество юмора (0-10)
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
          <span>Серьезно</span>
          <span>Очень смешно</span>
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

