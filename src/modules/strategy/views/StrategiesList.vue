<template>
  <div class="strategies-list">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            Стратегии контента
          </h1>
          <p class="text-gray-600">
            Управляйте вашими стратегиями контента
          </p>
        </div>
        <router-link
          to="/strategies/create"
          class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Создать стратегию
        </router-link>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Всего стратегий</p>
              <p class="text-2xl font-semibold text-gray-900">{{ totalStrategies }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Опубликовано</p>
              <p class="text-2xl font-semibold text-gray-900">{{ publishedStrategies }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Черновики</p>
              <p class="text-2xl font-semibold text-gray-900">{{ draftStrategies }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Поиск</label>
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Поиск по названию..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Тип персоны</label>
            <select
              v-model="personaTypeFilter"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все типы</option>
              <option value="expert">Эксперт</option>
              <option value="mentor">Наставник</option>
              <option value="friend">Друг</option>
              <option value="teacher">Учитель</option>
              <option value="inspirer">Вдохновитель</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Тон</label>
            <select
              v-model="toneTypeFilter"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все тона</option>
              <option value="calm">Спокойный</option>
              <option value="agressive">Агрессивный</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Формальность</label>
            <select
              v-model="formalityFilter"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все уровни</option>
              <option value="casual">Неформальный</option>
              <option value="professional">Профессиональный</option>
              <option value="humorous">Юмористический</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Загрузка стратегий...</p>
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

      <!-- Strategies List -->
      <div v-else-if="strategies.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="strategy in strategies"
          :key="strategy.id"
          class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
          @click="goToStrategy(strategy.id)"
        >
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">{{ strategy.name }}</h3>
              <span
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="strategy.publishedAt ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
              >
                {{ strategy.publishedAt ? 'Опубликовано' : 'Черновик' }}
              </span>
            </div>
            
            <div class="space-y-2 text-sm text-gray-600">
              <p><span class="font-medium">Персона:</span> {{ getPersonaTypeLabel(strategy.personaType) }}</p>
              <p><span class="font-medium">Тон:</span> {{ getToneTypeLabel(strategy.toneType) }}</p>
              <p><span class="font-medium">Формальность:</span> {{ getFormalityLabel(strategy.formality) }}</p>
              <p><span class="font-medium">Постов в месяц:</span> {{ strategy.targetPostCount }}</p>
            </div>

            <div class="mt-4 pt-4 border-t border-gray-200">
              <p class="text-xs text-gray-500">
                Создано: {{ formatDate(strategy.createdAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Нет стратегий</h3>
        <p class="mt-1 text-sm text-gray-500">Начните с создания вашей первой стратегии контента.</p>
        <div class="mt-6">
          <router-link
            to="/strategies/create"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Создать стратегию
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const router = useRouter();
const store = useStore();

const strategies = computed(() => store.getters['strategy/allStrategies']);
const totalStrategies = computed(() => store.getters['strategy/totalStrategies']);
const publishedStrategies = computed(() => store.getters['strategy/publishedStrategies']);
const draftStrategies = computed(() => store.getters['strategy/draftStrategies']);
const isLoading = computed(() => store.getters['strategy/isLoading']);
const error = computed(() => store.getters['strategy/error']);

const searchTerm = computed({
  get: () => store.getters['strategy/filters'].searchTerm || '',
  set: (value) => updateFilters({ searchTerm: value })
});

const personaTypeFilter = computed({
  get: () => store.getters['strategy/filters'].personaType || '',
  set: (value) => updateFilters({ personaType: value })
});

const toneTypeFilter = computed({
  get: () => store.getters['strategy/filters'].toneType || '',
  set: (value) => updateFilters({ toneType: value })
});

const formalityFilter = computed({
  get: () => store.getters['strategy/filters'].formality || '',
  set: (value) => updateFilters({ formality: value })
});

const updateFilters = (filters: any) => {
  store.dispatch('strategy/updateFilters', filters);
};

const goToStrategy = (id: number) => {
  router.push({ name: 'StrategyDetail', params: { id: id.toString() } });
};

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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU');
};

onMounted(() => {
  store.dispatch('strategy/fetchStrategies');
});
</script>

