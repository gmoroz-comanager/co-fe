<template>
  <div class="strategy-detail">
    <div class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Загрузка стратегии...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <div class="flex">
          <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Ошибка загрузки</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Strategy Content -->
      <div v-else-if="strategy" class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-start mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ strategy.name }}</h1>
            <div class="flex items-center space-x-4">
              <span
                class="px-3 py-1 text-sm font-medium rounded-full"
                :class="strategy.publishedAt ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
              >
                {{ strategy.publishedAt ? 'Опубликовано' : 'Черновик' }}
              </span>
              <span class="text-sm text-gray-500">
                Создано: {{ formatDate(strategy.createdAt) }}
              </span>
            </div>
          </div>
          <div class="flex space-x-3">
            <button
              @click="togglePublish"
              :disabled="isLoading"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {{ strategy.publishedAt ? 'Снять с публикации' : 'Опубликовать' }}
            </button>
            <button
              @click="deleteStrategy"
              :disabled="isLoading"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Удалить
            </button>
          </div>
        </div>

        <!-- Strategy Details -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Left Column -->
          <div class="space-y-6">
            <!-- Basic Information -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Основная информация</h2>
              <div class="space-y-3">
                <div>
                  <span class="text-sm font-medium text-gray-500">Тип персоны:</span>
                  <p class="text-gray-900">{{ getPersonaTypeLabel(strategy.personaType) }}</p>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-500">Целевая аудитория:</span>
                  <p class="text-gray-900">{{ strategy.targetAudience }}</p>
                </div>
                <div v-if="strategy.languagesArray">
                  <span class="text-sm font-medium text-gray-500">Языки:</span>
                  <p class="text-gray-900">{{ strategy.languagesArray }}</p>
                </div>
              </div>
            </div>

            <!-- Tone and Style -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Тон и стиль</h2>
              <div class="space-y-3">
                <div>
                  <span class="text-sm font-medium text-gray-500">Тон:</span>
                  <p class="text-gray-900">{{ getToneTypeLabel(strategy.toneType) }}</p>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-500">Формальность:</span>
                  <p class="text-gray-900">{{ getFormalityLabel(strategy.formality) }}</p>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-500">Длина предложений:</span>
                  <p class="text-gray-900">{{ getSentenceLengthLabel(strategy.sentenceLength) }}</p>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-500">Количество юмора:</span>
                  <p class="text-gray-900">{{ strategy.humorAmount }}/10</p>
                </div>
              </div>
            </div>

            <!-- Lexicon -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Лексика</h2>
              <div class="space-y-4">
                <div v-if="strategy.lexiconPreferred">
                  <span class="text-sm font-medium text-gray-500">Предпочитаемые слова:</span>
                  <p class="text-gray-900 whitespace-pre-wrap">{{ strategy.lexiconPreferred }}</p>
                </div>
                <div v-if="strategy.lexiconAvoid">
                  <span class="text-sm font-medium text-gray-500">Избегаемые слова:</span>
                  <p class="text-gray-900 whitespace-pre-wrap">{{ strategy.lexiconAvoid }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-6">
            <!-- Core Values -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Ценности и принципы</h2>
              <div class="space-y-4">
                <div v-if="strategy.coreValues">
                  <span class="text-sm font-medium text-gray-500">Основные ценности:</span>
                  <p class="text-gray-900 whitespace-pre-wrap">{{ strategy.coreValues }}</p>
                </div>
                <div v-if="strategy.avoidTopics">
                  <span class="text-sm font-medium text-gray-500">Избегаемые темы:</span>
                  <p class="text-gray-900 whitespace-pre-wrap">{{ strategy.avoidTopics }}</p>
                </div>
              </div>
            </div>

            <!-- Goals and Settings -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Цели и настройки</h2>
              <div class="space-y-3">
                <div>
                  <span class="text-sm font-medium text-gray-500">Постов в месяц:</span>
                  <p class="text-gray-900">{{ strategy.targetPostCount }}</p>
                </div>
                <div v-if="strategy.smmChannelsArray">
                  <span class="text-sm font-medium text-gray-500">Социальные сети:</span>
                  <p class="text-gray-900">{{ strategy.smmChannelsArray }}</p>
                </div>
                <div v-if="strategy.mainGoalsArray">
                  <span class="text-sm font-medium text-gray-500">Основные цели:</span>
                  <p class="text-gray-900 whitespace-pre-wrap">{{ strategy.mainGoalsArray }}</p>
                </div>
              </div>
            </div>

            <!-- Call to Action -->
            <div v-if="strategy.callToActionFormatsArray" class="bg-white rounded-lg shadow-sm border p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Призывы к действию</h2>
              <p class="text-gray-900 whitespace-pre-wrap">{{ strategy.callToActionFormatsArray }}</p>
            </div>

            <!-- User Examples -->
            <div v-if="strategy.userExamples" class="bg-white rounded-lg shadow-sm border p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Примеры контента</h2>
              <p class="text-gray-900 whitespace-pre-wrap">{{ strategy.userExamples }}</p>
            </div>

            <!-- Additional Settings -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Дополнительные настройки</h2>
              <div class="space-y-2">
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 mr-2">Эмодзи:</span>
                  <span :class="strategy.useEmodji ? 'text-green-600' : 'text-red-600'">
                    {{ strategy.useEmodji ? 'Да' : 'Нет' }}
                  </span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 mr-2">Вопросы аудитории:</span>
                  <span :class="strategy.useAudienceQuestions ? 'text-green-600' : 'text-red-600'">
                    {{ strategy.useAudienceQuestions ? 'Да' : 'Нет' }}
                  </span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 mr-2">Сленг:</span>
                  <span :class="strategy.useSlang ? 'text-green-600' : 'text-red-600'">
                    {{ strategy.useSlang ? 'Да' : 'Нет' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';

const router = useRouter();
const route = useRoute();
const store = useStore();

const strategy = computed(() => store.getters['strategy/currentStrategy']);
const isLoading = computed(() => store.getters['strategy/isLoading']);
const error = computed(() => store.getters['strategy/error']);

const getPersonaTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    expert: 'Эксперт',
    mentor: 'Наставник',
    friend: 'Друг',
    teacher: 'Учитель',
    inspirer: 'Вдохновитель'
  };
  return labels[type] || type;
};

const getToneTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    calm: 'Спокойный',
    agressive: 'Агрессивный'
  };
  return labels[type] || type;
};

const getFormalityLabel = (type: string) => {
  const labels: Record<string, string> = {
    casual: 'Неформальный',
    professional: 'Профессиональный',
    humorous: 'Юмористический'
  };
  return labels[type] || type;
};

const getSentenceLengthLabel = (type: string) => {
  const labels: Record<string, string> = {
    short: 'Короткие',
    medium: 'Средние',
    long: 'Длинные'
  };
  return labels[type] || type;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU');
};

const togglePublish = async () => {
  if (!strategy.value) return;
  
  try {
    if (strategy.value.publishedAt) {
      await store.dispatch('strategy/unpublishStrategy', strategy.value.id);
    } else {
      await store.dispatch('strategy/publishStrategy', strategy.value.id);
    }
  } catch (error) {
    console.error('Error toggling publish status:', error);
  }
};

const deleteStrategy = async () => {
  if (!strategy.value) return;
  
  if (confirm('Вы уверены, что хотите удалить эту стратегию?')) {
    try {
      await store.dispatch('strategy/deleteStrategy', strategy.value.id);
      router.push({ name: 'StrategiesList' });
    } catch (error) {
      console.error('Error deleting strategy:', error);
    }
  }
};

onMounted(() => {
  const id = route.params.id as string;
  if (id) {
    store.dispatch('strategy/fetchStrategy', id);
  }
});
</script>

