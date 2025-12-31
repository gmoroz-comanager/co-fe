<template>
  <div class="session-detail-page">
    <!-- Header -->
    <SessionHeader
      :session="session"
      :processing="processing"
      :processing-progress="processingProgress"
      :can-process="canProcess"
      @back="goBack"
      @process="processSession"
      @upload="showUploadDialog = true"
    />

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p>Loading session...</p>
    </div>

    <!-- Main Content -->
    <main v-else-if="session" class="session-content">
      <!-- Overview Section -->
      <SessionOverview :session="session" />

      <!-- Sources Section -->
      <SessionSources
        :sources="session.audio_sources || []"
        v-model:selected-sources="selectedSources"
        :generating-ideas="generatingIdeas"
        @upload="showUploadDialog = true"
        @generate-ideas="generateIdeas"
        @clear-selection="selectedSources = []"
      />

      <!-- Ideas Section -->
      <SessionIdeas
        :ideas="session.ideas || []"
        @open-idea="openIdea"
      />
    </main>

    <!-- Bulk Upload Dialog -->
    <BulkAudioUploader
      v-model="showUploadDialog"
      :session-document-id="sessionDocumentId"
      @uploaded="onFilesUploaded"
      @close="onUploadDialogClose"
    />

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, reactive, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';

// Components
import SessionHeader from './components/SessionHeader.vue';
import SessionOverview from './components/SessionOverview.vue';
import SessionSources from './components/SessionSources.vue';
import SessionIdeas from './components/SessionIdeas.vue';
import BulkAudioUploader from './components/BulkAudioUploader.vue';

export default defineComponent({
  name: 'SessionDetail',

  components: {
    SessionHeader,
    SessionOverview,
    SessionSources,
    SessionIdeas,
    BulkAudioUploader,
  },

  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();

    // State
    const processing = ref(false);
    const generatingIdeas = ref(false);
    const selectedSources = ref<string[]>([]);
    const showUploadDialog = ref(false);

    const snackbar = reactive({
      show: false,
      message: '',
      color: 'success',
    });

    // Computed
    const session = computed(() => store.getters['sessions/currentSession']);
    const loading = computed(() => store.getters['sessions/isLoading']);
    const processingProgress = computed(() => store.getters['sessions/processingProgress']);
    const sessionDocumentId = computed(() => route.params.id as string);

    const canProcess = computed(() => {
      if (!session.value) return false;
      const status = session.value.work_status;
      const hasSources = session.value.audio_sources?.length > 0;
      return (status === 'draft' || status === 'error') && hasSources;
    });

    // Methods
    const showMessage = (message: string, color = 'success') => {
      snackbar.message = message;
      snackbar.color = color;
      snackbar.show = true;
    };

    const goBack = () => {
      router.push({ name: 'SessionsList' });
    };

    const processSession = async () => {
      processing.value = true;
      try {
        await store.dispatch('sessions/processSession', route.params.id);
        showMessage('Processing started');
      } catch (error: any) {
        showMessage(error.message || 'Failed to start processing', 'error');
      } finally {
        processing.value = false;
      }
    };

    const generateIdeas = async () => {
      if (selectedSources.value.length === 0) {
        showMessage('Please select at least one source', 'warning');
        return;
      }

      generatingIdeas.value = true;
      try {
        await store.dispatch('sessions/generateIdeas', {
          documentId: route.params.id,
          audioSourceIds: selectedSources.value,
        });
        showMessage('Idea generation started');
        selectedSources.value = [];
      } catch (error: any) {
        showMessage(error.message || 'Failed to generate ideas', 'error');
      } finally {
        generatingIdeas.value = false;
      }
    };

    const openIdea = (documentId: string) => {
      router.push({ name: 'IdeaDetail', params: { id: documentId } });
    };

    const onFilesUploaded = async (count: number) => {
      showMessage(`${count} file(s) uploaded successfully`);
      // Refresh session data
      await store.dispatch('sessions/fetchSession', route.params.id);
    };

    const onUploadDialogClose = () => {
      // Dialog was closed, refresh if needed
    };

    // Lifecycle
    onMounted(async () => {
      const sessionId = route.params.id as string;
      await store.dispatch('sessions/fetchSession', sessionId);

      // Start polling if processing
      if (session.value?.work_status === 'processing') {
        store.dispatch('sessions/startStatusPolling', sessionId);
      }
    });

    onUnmounted(() => {
      store.dispatch('sessions/stopStatusPolling');
      store.dispatch('sessions/clearCurrentSession');
    });

    // Watch for status changes to start/stop polling
    watch(
      () => session.value?.work_status,
      (newStatus, oldStatus) => {
        if (newStatus === 'processing' && oldStatus !== 'processing') {
          store.dispatch('sessions/startStatusPolling', route.params.id);
        }
      }
    );

    return {
      // State
      processing,
      generatingIdeas,
      selectedSources,
      showUploadDialog,
      snackbar,

      // Computed
      session,
      loading,
      processingProgress,
      canProcess,
      sessionDocumentId,

      // Methods
      goBack,
      processSession,
      generateIdeas,
      openIdea,
      onFilesUploaded,
      onUploadDialogClose,
    };
  },
});
</script>

<style scoped>
.session-detail-page {
  min-height: calc(100vh - 64px);
  background: #f5f5f5;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px;
  color: #666;
}

.loading-state p {
  margin-top: 16px;
}

/* Main Content */
.session-content {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
