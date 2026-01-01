<template>
  <div class="idea-detail-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p>Loading idea...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <v-alert type="error">{{ error }}</v-alert>
    </div>

    <!-- Main Content -->
    <template v-else-if="idea">
      <!-- Header with Breadcrumbs -->
      <IdeaHeader :idea="idea" />

      <!-- Content -->
      <main class="idea-main">
        <IdeaContent :idea="idea" />

        <!-- Actions -->
        <IdeaActions
          :like-loading="likeLoading"
          :dislike-loading="dislikeLoading"
          :polish-loading="polishLoading"
          :publishing="publishing"
          :has-polished-content="!!idea.polishedBody"
          @like="handleLike"
          @dislike="handleDislike"
          @polish="submitPolishRequest"
          @post="openPostDialog"
        />
      </main>

      <!-- Telegram Post Dialog -->
      <TelegramPostDialog
        v-model="postDialogOpen"
        :selected-channel="selectedChannelId"
        :channels="channels"
        :channels-loading="channelsLoading"
        :publishing="publishing"
        @update:selected-channel="selectedChannelId = $event"
        @post="postToTelegram"
      />
    </template>

    <!-- Not Found State -->
    <div v-else class="error-state">
      <v-alert type="warning">Idea not found</v-alert>
    </div>

    <!-- Snackbar for feedback -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      :timeout="3000"
    >
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { ideasService, Idea } from '../api/ideas.service';
import { postingService } from '../../posting/api/posting.service';

// Components
import IdeaHeader from './components/IdeaHeader.vue';
import IdeaContent from './components/IdeaContent.vue';
import IdeaActions from './components/IdeaActions.vue';
import TelegramPostDialog from './components/TelegramPostDialog.vue';

export default {
  name: 'IdeaDetail',

  components: {
    IdeaHeader,
    IdeaContent,
    IdeaActions,
    TelegramPostDialog,
  },

  setup() {
    const route = useRoute();
    const store = useStore();

    // State
    const idea = ref<Idea | null>(null);
    const loading = ref(true);
    const error = ref<string | null>(null);

    // Feedback state
    const likeLoading = ref(false);
    const dislikeLoading = ref(false);
    const polishLoading = ref(false);

    // Snackbar state
    const snackbar = ref(false);
    const snackbarMessage = ref('');
    const snackbarColor = ref('success');

    // Telegram Posting
    const postDialogOpen = ref(false);
    const selectedChannelId = ref<string | null>(null);
    const publishing = ref(false);

    const channels = computed(() => store.getters['posting/channels']);
    const channelsLoading = computed(() => store.getters['posting/isLoading']);

    // Helper
    const showSnackbar = (message: string, color = 'success') => {
      snackbarMessage.value = message;
      snackbarColor.value = color;
      snackbar.value = true;
    };

    const getIdeaId = (): string => {
      return Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
    };

    // API Methods
    const fetchIdea = async () => {
      loading.value = true;
      error.value = null;

      try {
        const ideaId = getIdeaId();
        const response = await ideasService.getIdea(ideaId);
        idea.value = response.data;
      } catch (err: unknown) {
        console.error('Error fetching idea:', err);
        error.value = err instanceof Error ? err.message : 'Failed to fetch idea details';
      } finally {
        loading.value = false;
      }
    };

    const handleLike = async () => {
      likeLoading.value = true;
      try {
        const ideaId = getIdeaId();
        await ideasService.likeIdea(ideaId);
        showSnackbar('You liked this idea!');
      } catch (err) {
        console.error('Error liking idea:', err);
        showSnackbar('Failed to record like', 'error');
      } finally {
        likeLoading.value = false;
      }
    };

    const handleDislike = async () => {
      dislikeLoading.value = true;
      try {
        const ideaId = getIdeaId();
        await ideasService.dislikeIdea(ideaId);
        showSnackbar('You disliked this idea.', 'warning');
      } catch (err) {
        console.error('Error disliking idea:', err);
        showSnackbar('Failed to record dislike', 'error');
      } finally {
        dislikeLoading.value = false;
      }
    };

    const submitPolishRequest = async (feedback: string) => {
      polishLoading.value = true;
      try {
        const ideaId = getIdeaId();
        const response = await ideasService.polishIdea(ideaId, feedback);

        if (response.data) {
          idea.value = response.data;
          showSnackbar('Idea polished successfully!');
        }
      } catch (err: unknown) {
        console.error('Error polishing idea:', err);
        const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
        showSnackbar(
          axiosError.response?.data?.error?.message || 'Failed to polish idea',
          'error'
        );
      } finally {
        polishLoading.value = false;
      }
    };

    const openPostDialog = () => {
      postDialogOpen.value = true;
      store.dispatch('posting/fetchChannels');
    };

    const postToTelegram = async () => {
      if (!idea.value || !selectedChannelId.value) return;

      publishing.value = true;
      try {
        const result = await postingService.publishIdea(
          idea.value.documentId,
          selectedChannelId.value
        );

        showSnackbar('Posted to Telegram successfully!');
        postDialogOpen.value = false;

        if (result.url) {
          window.open(result.url, '_blank');
        }
      } catch (err: unknown) {
        console.error('Error posting to Telegram:', err);
        const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
        showSnackbar(
          axiosError.response?.data?.error?.message || 'Failed to post to Telegram',
          'error'
        );
      } finally {
        publishing.value = false;
      }
    };

    // Lifecycle
    onMounted(() => {
      fetchIdea();
    });

    return {
      // State
      idea,
      loading,
      error,
      likeLoading,
      dislikeLoading,
      polishLoading,
      snackbar,
      snackbarMessage,
      snackbarColor,
      postDialogOpen,
      selectedChannelId,
      publishing,
      channels,
      channelsLoading,

      // Methods
      handleLike,
      handleDislike,
      submitPolishRequest,
      openPostDialog,
      postToTelegram,
    };
  },
};
</script>

<style scoped>
.idea-detail-page {
  min-height: calc(100vh - 64px);
  background: #f5f5f5;
}

/* Loading / Error States */
.loading-state,
.error-state {
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
.idea-main {
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
</style>
