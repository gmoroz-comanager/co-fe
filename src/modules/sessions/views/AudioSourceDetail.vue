<template>
  <div class="audio-source-detail-page">
    <!-- Breadcrumbs -->
    <PageBreadcrumbs :items="breadcrumbs" />

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p>Loading audio source...</p>
    </div>

    <!-- Main Content -->
    <main v-else-if="audioSource" class="audio-content">
      <!-- Header Section -->
      <section class="content-section header-section">
        <div class="header-row">
          <div class="header-info">
            <h1>{{ audioSource.title || 'Untitled' }}</h1>
            <div class="header-meta">
              <v-chip
                :color="getSourceTypeColor(audioSource.source_type)"
                size="small"
                label
                class="mr-2"
              >
                <v-icon start size="small">{{ getSourceTypeIcon(audioSource.source_type) }}</v-icon>
                {{ audioSource.source_type || 'dialogue' }}
              </v-chip>
              <v-chip
                :color="getStatusColor(audioSource.work_status)"
                size="small"
                label
              >
                {{ audioSource.work_status || 'created' }}
              </v-chip>
            </div>
          </div>

          <div class="header-actions">
            <v-btn
              variant="outlined"
              prepend-icon="mdi-arrow-left"
              @click="goBackToSession"
            >
              Back to Session
            </v-btn>
          </div>
        </div>

        <!-- Audio Player -->
        <div v-if="audioFiles.length > 0" class="audio-player-section">
          <h4>Audio File</h4>
          <div 
            v-for="file in audioFiles" 
            :key="file.id"
            class="audio-file-item"
          >
            <div class="file-info">
              <v-icon color="primary" class="mr-2">mdi-file-music</v-icon>
              <span class="file-name">{{ file.name || 'Audio file' }}</span>
              <span v-if="file.size" class="file-size">
                ({{ formatFileSize(file.size) }})
              </span>
            </div>
            <audio 
              controls
              class="audio-element"
              :src="getBaseUrl() + file.url"
            ></audio>
          </div>
        </div>
      </section>

      <!-- Summary Section -->
      <section v-if="audioSource.summary" class="content-section summary-section">
        <h2>Summary</h2>
        <p class="summary-text">{{ audioSource.summary }}</p>
      </section>

      <!-- Speaker Mapping Section -->
      <section v-if="hasTranscript" class="content-section speakers-section">
        <SpeakerMapper 
          :transcript-structure="audioSource.transcript_structure || []"
          :speakers-map="audioSource.speakers || {}"
          @update:speakersMap="handleUpdateSpeakers"
        />
      </section>

      <!-- Transcription Section -->
      <section v-if="hasTranscript" class="content-section transcription-section">
        <h2>Transcription</h2>
        
        <div v-if="audioSource.transcript_structure?.length" class="transcript-structured">
          <div 
            v-for="(segment, idx) in audioSource.transcript_structure" 
            :key="idx" 
            class="transcript-segment"
          >
            <div class="segment-speaker" :class="getSpeakerClass(segment.speaker)">
              {{ getSpeakerName(segment.speaker) }}
            </div>
            <div class="segment-text">
              {{ segment.words?.join(' ') || segment.text }}
            </div>
          </div>
        </div>

        <div v-else-if="audioSource.transcription" class="transcript-plain">
          <p>{{ audioSource.transcription }}</p>
        </div>
      </section>

      <!-- No Transcription Yet -->
      <section v-else class="content-section empty-section">
        <v-icon size="64" color="grey-lighten-1">mdi-text-box-outline</v-icon>
        <p>No transcription available yet</p>
        <p class="hint">Process the session to generate transcription</p>
      </section>
    </main>

    <!-- Error State -->
    <div v-else class="error-state">
      <v-icon size="64" color="error">mdi-alert-circle</v-icon>
      <p>Failed to load audio source</p>
      <v-btn color="primary" @click="loadAudioSource">
        Try Again
      </v-btn>
    </div>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { sessionsService, AudioSource } from '../api/sessions.service';
import httpService from '@/core/api/http';
import SpeakerMapper from '@/modules/audio/views/components/SpeakerMapper.vue';
import { PageBreadcrumbs } from '@/core/components';
import type { BreadcrumbItem } from '@/core/components/types';

export default defineComponent({
  name: 'AudioSourceDetail',

  components: {
    SpeakerMapper,
    PageBreadcrumbs,
  },

  setup() {
    const route = useRoute();
    const router = useRouter();

    // State
    const audioSource = ref<AudioSource | null>(null);
    const loading = ref(true);
    const sessionId = ref<string | null>(null);
    const sessionTitle = ref<string | null>(null);

    const snackbar = reactive({
      show: false,
      message: '',
      color: 'success',
    });

    // Computed
    const audioFiles = computed(() => {
      if (!audioSource.value) return [];
      const files = audioSource.value.audio_file;
      // Strapi v5 returns arrays directly without data wrapper
      if (Array.isArray(files)) return files;
      return [];
    });

    const hasTranscript = computed(() => {
      if (!audioSource.value) return false;
      return (
        audioSource.value.transcript_structure?.length ||
        audioSource.value.transcription
      );
    });

    // Breadcrumbs
    const breadcrumbs = computed((): BreadcrumbItem[] => {
      const items: BreadcrumbItem[] = [];

      items.push({
        title: 'Sessions',
        to: '/sessions',
        icon: 'mdi-home',
      });

      if (sessionId.value) {
        items.push({
          title: sessionTitle.value || 'Session',
          to: `/sessions/${sessionId.value}`,
        });
      }

      items.push({
        title: audioSource.value?.title || 'Audio Source',
        disabled: true,
      });

      return items;
    });

    // Methods
    const showMessage = (message: string, color = 'success') => {
      snackbar.message = message;
      snackbar.color = color;
      snackbar.show = true;
    };

    const getBaseUrl = () => {
      return httpService.getBaseUrl();
    };

    const formatFileSize = (bytes: number): string => {
      if (!bytes) return '';
      const mb = bytes / 1024 / 1024;
      return mb.toFixed(2) + ' MB';
    };

    const getStatusColor = (status?: string) => {
      switch (status) {
        case 'ready':
        case 'summarized':
        case 'processed':
          return 'success';
        case 'processing':
        case 'transcribing':
        case 'summarizing':
          return 'warning';
        case 'error':
        case 'transcribing_failed':
        case 'summarizing_failed':
          return 'error';
        default:
          return 'grey';
      }
    };

    const getSourceTypeIcon = (type?: string) => {
      switch (type) {
        case 'chat':
          return 'mdi-chat';
        case 'lecture':
          return 'mdi-school';
        default:
          return 'mdi-microphone';
      }
    };

    const getSourceTypeColor = (type?: string) => {
      switch (type) {
        case 'chat':
          return 'blue';
        case 'lecture':
          return 'purple';
        default:
          return 'green';
      }
    };

    const getSpeakerName = (speakerLabel: string): string => {
      const speakersMap = audioSource.value?.speakers;
      if (!speakersMap || !speakersMap[speakerLabel]) return speakerLabel;
      const mapping = speakersMap[speakerLabel];
      if (mapping.type === 'me') return 'Me';
      if (mapping.type === 'contact') return mapping.name || 'Unknown Contact';
      return speakerLabel;
    };

    const getSpeakerClass = (speakerLabel: string): string => {
      const speakersMap = audioSource.value?.speakers;
      if (!speakersMap || !speakersMap[speakerLabel]) return 'speaker-unknown';
      const mapping = speakersMap[speakerLabel];
      if (mapping.type === 'me') return 'speaker-me';
      if (mapping.type === 'contact') return 'speaker-contact';
      return 'speaker-unknown';
    };

    const handleUpdateSpeakers = async (newMap: Record<string, any>) => {
      if (!audioSource.value) return;

      try {
        const sourceId = route.params.sourceId as string;
        await sessionsService.updateAudioSource(sourceId, { speakers: newMap });
        audioSource.value.speakers = newMap;
        showMessage('Speaker mapping updated');
      } catch (error) {
        console.error('Error updating speakers:', error);
        showMessage('Failed to update speakers', 'error');
      }
    };

    const goBackToSession = () => {
      if (sessionId.value) {
        router.push({ name: 'SessionDetail', params: { id: sessionId.value } });
      } else {
        router.push({ name: 'SessionsList' });
      }
    };

    const loadAudioSource = async () => {
      loading.value = true;
      const sourceId = route.params.sourceId as string;
      sessionId.value = route.params.sessionId as string || null;

      try {
        const response = await sessionsService.getAudioSource(sourceId);
        audioSource.value = response.data;

        // Get session info if available from the audio source
        if (audioSource.value?.session) {
          const session = audioSource.value.session as any;
          sessionId.value = session.documentId || session.id;
          sessionTitle.value = session.title;
        }
      } catch (error) {
        console.error('Error loading audio source:', error);
        audioSource.value = null;
      } finally {
        loading.value = false;
      }
    };

    // Lifecycle
    onMounted(() => {
      loadAudioSource();
    });

    return {
      // State
      audioSource,
      loading,
      sessionId,
      sessionTitle,
      snackbar,

      // Computed
      audioFiles,
      hasTranscript,
      breadcrumbs,

      // Methods
      getBaseUrl,
      formatFileSize,
      getStatusColor,
      getSourceTypeIcon,
      getSourceTypeColor,
      getSpeakerName,
      getSpeakerClass,
      handleUpdateSpeakers,
      goBackToSession,
      loadAudioSource,
    };
  },
});
</script>

<style scoped>
.audio-source-detail-page {
  min-height: calc(100vh - 64px);
  background: #f5f5f5;
}

/* Loading State */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px;
  color: #666;
}

.loading-state p,
.error-state p {
  margin-top: 16px;
}

/* Main Content */
.audio-content {
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.content-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.content-section h2 {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
}

/* Header Section */
.header-section h1 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 24px;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  flex-shrink: 0;
}

/* Audio Player */
.audio-player-section {
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.audio-player-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  margin: 0 0 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.audio-file-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.file-info {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.file-name {
  font-weight: 500;
}

.file-size {
  color: #999;
  margin-left: 8px;
  font-size: 13px;
}

.audio-element {
  width: 100%;
  border-radius: 8px;
}

/* Summary Section */
.summary-text {
  line-height: 1.6;
  color: #333;
}

/* Speakers Section */
.speakers-section {
  padding: 0;
}

.speakers-section :deep(.speaker-mapper) {
  box-shadow: none;
  margin: 0;
}

/* Transcription Section */
.transcript-structured {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.transcript-segment {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.segment-speaker {
  flex-shrink: 0;
  font-weight: 600;
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 4px;
  min-width: 100px;
  text-align: center;
}

.speaker-me {
  background: #e3f2fd;
  color: #1565c0;
}

.speaker-contact {
  background: #e8f5e9;
  color: #2e7d32;
}

.speaker-unknown {
  background: #f5f5f5;
  color: #666;
}

.segment-text {
  flex: 1;
  line-height: 1.6;
  color: #333;
}

.transcript-plain {
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
}

/* Empty Section */
.empty-section {
  text-align: center;
  padding: 48px 24px;
  color: #666;
}

.empty-section p {
  margin: 12px 0;
}

.hint {
  font-size: 13px;
  color: #999;
}

/* Responsive */
@media (max-width: 768px) {
  .header-row {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .v-btn {
    width: 100%;
  }

  .transcript-segment {
    flex-direction: column;
    gap: 8px;
  }

  .segment-speaker {
    align-self: flex-start;
  }
}
</style>

