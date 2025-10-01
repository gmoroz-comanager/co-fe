<template>
  <div class="strategy-create-step1">
    <div class="mb-6">
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">
        Основная информация
      </h2>
      <p class="text-gray-600">
        Расскажите нам о вашей стратегии контента
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Strategy Name -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
          Название стратегии *
        </label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Например: Стратегия для IT-компании"
        />
      </div>

      <!-- Persona Type -->
      <div>
        <label for="personaType" class="block text-sm font-medium text-gray-700 mb-2">
          Тип персоны *
        </label>
        <select
          id="personaType"
          v-model="formData.personaType"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Выберите тип персоны</option>
          <option value="expert">Эксперт</option>
          <option value="mentor">Наставник</option>
          <option value="friend">Друг</option>
          <option value="teacher">Учитель</option>
          <option value="inspirer">Вдохновитель</option>
        </select>
      </div>

      <!-- Target Audience -->
      <div>
        <label for="targetAudience" class="block text-sm font-medium text-gray-700 mb-2">
          Целевая аудитория *
        </label>
        <textarea
          id="targetAudience"
          v-model="formData.targetAudience"
          required
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Опишите вашу целевую аудиторию..."
        ></textarea>
      </div>

      <!-- Languages -->
      <div>
        <label for="languagesArray" class="block text-sm font-medium text-gray-700 mb-2">
          Языки контента
        </label>
        <input
          id="languagesArray"
          v-model="formData.languagesArray"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Например: русский, английский"
        />
        <p class="text-sm text-gray-500 mt-1">
          Укажите языки через запятую
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
  name: '',
  personaType: '',
  targetAudience: '',
  languagesArray: ''
});

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

