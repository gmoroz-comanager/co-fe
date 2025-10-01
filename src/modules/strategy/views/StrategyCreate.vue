<template>
  <div class="strategy-create">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Создание стратегии контента
        </h1>
        <p class="text-gray-600">
          Создайте эффективную стратегию контента за 4 простых шага
        </p>
      </div>

      <!-- Progress Steps -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div 
            v-for="(step, index) in steps" 
            :key="index"
            class="flex items-center"
          >
            <div 
              class="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors"
              :class="getStepClass(index + 1)"
            >
              <span class="text-sm font-medium">{{ index + 1 }}</span>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium" :class="getStepTextClass(index + 1)">
                {{ step.title }}
              </p>
              <p class="text-xs text-gray-500">{{ step.description }}</p>
            </div>
            <div 
              v-if="index < steps.length - 1"
              class="flex-1 h-0.5 bg-gray-200 mx-4"
              :class="{ 'bg-blue-500': currentStep > index + 1 }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Step Content -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <router-view />
      </div>

      <!-- Navigation -->
      <div class="flex justify-between mt-6">
        <button
          v-if="currentStep > 1"
          @click="goToPreviousStep"
          class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Назад
        </button>
        <div v-else></div>
        
        <button
          v-if="currentStep < 4"
          @click="goToNextStep"
          :disabled="!isCurrentStepComplete"
          class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Далее
        </button>
        <button
          v-else
          @click="saveStrategy"
          :disabled="!isCurrentStepComplete || isSaving"
          class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="isSaving">Сохранение...</span>
          <span v-else>Создать стратегию</span>
        </button>
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

const steps = [
  {
    title: 'Основная информация',
    description: 'Название и аудитория'
  },
  {
    title: 'Тон и стиль',
    description: 'Настройка коммуникации'
  },
  {
    title: 'Лексика и ценности',
    description: 'Словарь и принципы'
  },
  {
    title: 'Настройки и цели',
    description: 'Финальные параметры'
  }
];

const currentStep = computed(() => store.getters['strategy/currentStep']);
const isCurrentStepComplete = computed(() => store.getters['strategy/isStepComplete'](currentStep.value));
const isSaving = computed(() => store.getters['strategy/isLoading']);

const getStepClass = (stepNumber: number) => {
  if (currentStep.value > stepNumber) {
    return 'bg-green-500 border-green-500 text-white';
  } else if (currentStep.value === stepNumber) {
    return 'bg-blue-500 border-blue-500 text-white';
  } else {
    return 'bg-white border-gray-300 text-gray-500';
  }
};

const getStepTextClass = (stepNumber: number) => {
  if (currentStep.value >= stepNumber) {
    return 'text-gray-900';
  } else {
    return 'text-gray-500';
  }
};

const goToNextStep = () => {
  if (currentStep.value < 4 && isCurrentStepComplete.value) {
    const nextStep = currentStep.value + 1;
    store.commit('strategy/SET_CURRENT_STEP', nextStep);
    router.push({ name: `StrategyCreateStep${nextStep}` });
  }
};

const goToPreviousStep = () => {
  if (currentStep.value > 1) {
    const prevStep = currentStep.value - 1;
    store.commit('strategy/SET_CURRENT_STEP', prevStep);
    router.push({ name: `StrategyCreateStep${prevStep}` });
  }
};

const saveStrategy = async () => {
  try {
    await store.dispatch('strategy/saveStrategyFromCreationData');
    router.push({ name: 'StrategiesList' });
  } catch (error) {
    console.error('Error saving strategy:', error);
  }
};

onMounted(() => {
  // Set current step based on route
  const stepName = route.name as string;
  if (stepName.includes('Step')) {
    const stepNumber = parseInt(stepName.replace('StrategyCreateStep', ''));
    store.commit('strategy/SET_CURRENT_STEP', stepNumber);
  }
});
</script>

<style scoped>
.strategy-create {
  min-height: 100vh;
  background-color: #f9fafb;
}
</style>

