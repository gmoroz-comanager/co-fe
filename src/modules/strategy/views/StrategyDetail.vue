<template>
  <div class="strategy-detail">
    <div class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Loading strategy...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <div class="flex">
          <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Loading Error</h3>
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
                {{ strategy.publishedAt ? 'Published' : 'Draft' }}
              </span>
              <span class="text-sm text-gray-500">
                Created: {{ formatDate(strategy.createdAt) }}
              </span>
            </div>
          </div>
          <div class="flex space-x-3">
            <button
              @click="deleteStrategy"
              :disabled="isLoading"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>

        <!-- Strategy Details -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Left Column -->
          <div class="space-y-6">
            <!-- Basic Information -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div class="space-y-3">
                <div>
                  <span class="text-sm font-medium text-gray-500">Persona Type:</span>
                  <p class="text-gray-900">{{ getPersonaTypeLabel(strategy.personaType) }}</p>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-500">Target Audience:</span>
                  <p class="text-gray-900">{{ strategy.targetAudience }}</p>
                </div>
                <div v-if="strategy.languagesArray">
                  <span class="text-sm font-medium text-gray-500">Languages:</span>
                  <p class="text-gray-900">{{ strategy.languagesArray }}</p>
                </div>
              </div>
            </div>

            <!-- Tone and Style -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Tone and Style</h2>
              <div class="space-y-3">
                <div>
                  <span class="text-sm font-medium text-gray-500">Tone:</span>
                  <p class="text-gray-900">{{ getToneTypeLabel(strategy.toneType) }}</p>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-500">Formality:</span>
                  <p class="text-gray-900">{{ getFormalityLabel(strategy.formality) }}</p>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-500">Sentence Length:</span>
                  <p class="text-gray-900">{{ getSentenceLengthLabel(strategy.sentenceLength) }}</p>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-500">Humor Amount:</span>
                  <p class="text-gray-900">{{ strategy.humorAmount }}/10</p>
                </div>
              </div>
            </div>

            <!-- Lexicon -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Lexicon</h2>
              <div class="space-y-4">
                <div v-if="strategy.lexiconPreferred">
                  <span class="text-sm font-medium text-gray-500">Preferred Words:</span>
                  <p class="text-gray-900 whitespace-pre-wrap">{{ strategy.lexiconPreferred }}</p>
                </div>
                <div v-if="strategy.lexiconAvoid">
                  <span class="text-sm font-medium text-gray-500">Words to Avoid:</span>
                  <p class="text-gray-900 whitespace-pre-wrap">{{ strategy.lexiconAvoid }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-6">
            <!-- Core Values -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Values and Principles</h2>
              <div class="space-y-4">
                <div v-if="strategy.coreValues">
                  <span class="text-sm font-medium text-gray-500">Core Values:</span>
                  <p class="text-gray-900 whitespace-pre-wrap">{{ strategy.coreValues }}</p>
                </div>
                <div v-if="strategy.avoidTopics">
                  <span class="text-sm font-medium text-gray-500">Topics to Avoid:</span>
                  <p class="text-gray-900 whitespace-pre-wrap">{{ strategy.avoidTopics }}</p>
                </div>
              </div>
            </div>

            <!-- Goals and Settings -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Goals and Settings</h2>
              <div class="space-y-3">
                <div>
                  <span class="text-sm font-medium text-gray-500">Posts per Month:</span>
                  <p class="text-gray-900">{{ strategy.targetPostCount }}</p>
                </div>
                <div v-if="strategy.smmChannelsArray">
                  <span class="text-sm font-medium text-gray-500">Social Networks:</span>
                  <p class="text-gray-900">{{ strategy.smmChannelsArray }}</p>
                </div>
                <div v-if="strategy.mainGoalsArray">
                  <span class="text-sm font-medium text-gray-500">Main Goals:</span>
                  <p class="text-gray-900 whitespace-pre-wrap">{{ strategy.mainGoalsArray }}</p>
                </div>
              </div>
            </div>

            <!-- Call to Action -->
            <div v-if="strategy.callToActionFormatsArray" class="bg-white rounded-lg shadow-sm border p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Calls to Action</h2>
              <p class="text-gray-900 whitespace-pre-wrap">{{ strategy.callToActionFormatsArray }}</p>
            </div>

            <!-- User Examples -->
            <div v-if="strategy.userExamples" class="bg-white rounded-lg shadow-sm border p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Content Examples</h2>
              <p class="text-gray-900 whitespace-pre-wrap">{{ strategy.userExamples }}</p>
            </div>

            <!-- Additional Settings -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Additional Settings</h2>
              <div class="space-y-2">
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 mr-2">Emojis:</span>
                  <span :class="strategy.useEmodji ? 'text-green-600' : 'text-red-600'">
                    {{ strategy.useEmodji ? 'Yes' : 'No' }}
                  </span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 mr-2">Audience Questions:</span>
                  <span :class="strategy.useAudienceQuestions ? 'text-green-600' : 'text-red-600'">
                    {{ strategy.useAudienceQuestions ? 'Yes' : 'No' }}
                  </span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 mr-2">Slang:</span>
                  <span :class="strategy.useSlang ? 'text-green-600' : 'text-red-600'">
                    {{ strategy.useSlang ? 'Yes' : 'No' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Dialog -->
    <ConfirmationDialog
      v-model="showDeleteConfirm"
      title="Delete Strategy"
      message="Are you sure you want to delete this strategy? This action cannot be undone."
      confirm-text="Delete"
      confirm-color="error"
      icon="mdi-delete-alert"
      icon-color="error"
      :loading="isDeleting"
      @confirm="confirmDeleteStrategy"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { ConfirmationDialog } from '@/core/components';

const router = useRouter();
const route = useRoute();
const store = useStore();

const strategy = computed(() => store.getters['strategy/currentStrategy']);
const isLoading = computed(() => store.getters['strategy/isLoading']);
const error = computed(() => store.getters['strategy/error']);

const getPersonaTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    expert: 'Expert',
    mentor: 'Mentor',
    friend: 'Friend',
    teacher: 'Teacher',
    inspirer: 'Inspirer'
  };
  return labels[type] || type;
};

const getToneTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    calm: 'Calm',
    agressive: 'Aggressive'
  };
  return labels[type] || type;
};

const getFormalityLabel = (type: string) => {
  const labels: Record<string, string> = {
    casual: 'Casual',
    professional: 'Professional',
    humorous: 'Humorous'
  };
  return labels[type] || type;
};

const getSentenceLengthLabel = (type: string) => {
  const labels: Record<string, string> = {
    short: 'Short',
    medium: 'Medium',
    long: 'Long'
  };
  return labels[type] || type;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US');
};


const showDeleteConfirm = ref(false);
const isDeleting = ref(false);

const deleteStrategy = () => {
  if (!strategy.value) return;
  showDeleteConfirm.value = true;
};

const confirmDeleteStrategy = async () => {
  if (!strategy.value) return;
  
  isDeleting.value = true;
  try {
    await store.dispatch('strategy/deleteStrategy', strategy.value.documentId);
    showDeleteConfirm.value = false;
    router.push({ name: 'StrategiesList' });
  } catch (error) {
    console.error('Error deleting strategy:', error);
    isDeleting.value = false;
  }
};

onMounted(() => {
  const id = route.params.id as string;
  if (id) {
    store.dispatch('strategy/fetchStrategy', id);
  }
});
</script>

