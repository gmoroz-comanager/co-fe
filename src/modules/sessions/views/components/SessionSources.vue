<template>
  <section class="content-section sources-section">
    <div class="section-header">
      <h2>Sources ({{ sources.length }})</h2>
      <v-btn
        size="small"
        variant="outlined"
        prepend-icon="mdi-upload"
        @click="$emit('upload')"
      >
        Upload Files
      </v-btn>
    </div>

    <div v-if="!sources.length" class="empty-sources">
      <v-icon size="48" color="grey-lighten-1">mdi-folder-music-outline</v-icon>
      <p>No audio sources yet</p>
      <v-btn color="primary" @click="$emit('upload')">
        Upload your first file
      </v-btn>
    </div>

    <div v-else class="sources-list">
      <div
        v-for="source in sources"
        :key="source.documentId"
        class="source-card"
        @click="openSourceDetail(source.documentId)"
      >
        <div class="source-icon">
          <v-icon :color="getSourceTypeColor(source.source_type)">
            {{ getSourceTypeIcon(source.source_type) }}
          </v-icon>
        </div>
        
        <div class="source-info">
          <div class="source-title">{{ source.title || 'Untitled' }}</div>
          <div class="source-meta">
            <v-chip size="x-small" :color="getStatusColor(source.work_status)" label>
              {{ source.work_status || 'created' }}
            </v-chip>
            
            <!-- Speaker Preview -->
            <div v-if="hasSpeakers(source)" class="speakers-preview">
              <v-icon size="x-small" class="mr-1">mdi-account-multiple</v-icon>
              <span 
                v-for="(speaker, index) in getSpeakersList(source)" 
                :key="speaker.label"
                class="speaker-chip"
                :class="speaker.class"
              >
                {{ speaker.name }}
                <span v-if="index < getSpeakersList(source).length - 1">, </span>
              </span>
            </div>
          </div>
        </div>

        <div class="source-actions" @click.stop>
          <v-checkbox
            v-if="source.summary"
            :model-value="isSelected(source.documentId)"
            @update:model-value="toggleSelection(source.documentId, $event)"
            hide-details
            density="compact"
          />
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn icon size="small" variant="text" v-bind="props">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list density="compact">
              <v-list-item
                prepend-icon="mdi-eye"
                title="View Details"
                @click="openSourceDetail(source.documentId)"
              />
              <v-list-item
                prepend-icon="mdi-pencil"
                title="Edit"
                @click="openSourceDetail(source.documentId)"
              />
            </v-list>
          </v-menu>
        </div>

        <!-- Hover indicator -->
        <v-icon class="chevron-icon" size="small">mdi-chevron-right</v-icon>
      </div>
    </div>

    <!-- Send to Content Button -->
    <div v-if="selectedSources.length > 0" class="sources-actions">
      <v-btn
        color="primary"
        prepend-icon="mdi-lightbulb-on"
        @click="$emit('generate-ideas')"
        :loading="generatingIdeas"
      >
        Send to Content ({{ selectedSources.length }} selected)
      </v-btn>
      <v-btn variant="text" @click="$emit('clear-selection')">
        Clear Selection
      </v-btn>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { AudioSource } from '../../api/sessions.service';

interface SpeakerInfo {
  label: string;
  name: string;
  class: string;
}

export default defineComponent({
  name: 'SessionSources',

  props: {
    sources: {
      type: Array as PropType<AudioSource[]>,
      default: () => [],
    },
    selectedSources: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    generatingIdeas: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['upload', 'generate-ideas', 'clear-selection', 'update:selected-sources'],

  setup(props, { emit }) {
    const router = useRouter();
    const route = useRoute();

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

    const isSelected = (documentId: string) => {
      return props.selectedSources.includes(documentId);
    };

    const toggleSelection = (documentId: string, selected: boolean | null) => {
      const newSelection = selected
        ? [...props.selectedSources, documentId]
        : props.selectedSources.filter((id) => id !== documentId);
      emit('update:selected-sources', newSelection);
    };

    const hasSpeakers = (source: AudioSource): boolean => {
      return !!(source.speakers && Object.keys(source.speakers).length > 0);
    };

    const getSpeakersList = (source: AudioSource): SpeakerInfo[] => {
      if (!source.speakers) return [];
      
      const speakers: SpeakerInfo[] = [];
      
      for (const [label, mapping] of Object.entries(source.speakers)) {
        const speakerMapping = mapping as any;
        if (speakerMapping.type === 'me') {
          speakers.push({
            label,
            name: 'Me',
            class: 'speaker-me',
          });
        } else if (speakerMapping.type === 'contact') {
          speakers.push({
            label,
            name: speakerMapping.name || 'Contact',
            class: 'speaker-contact',
          });
        }
      }
      
      return speakers;
    };

    const openSourceDetail = (sourceDocumentId: string) => {
      const sessionId = route.params.id as string;
      router.push({
        name: 'AudioSourceDetail',
        params: {
          sessionId,
          sourceId: sourceDocumentId,
        },
      });
    };

    return {
      getStatusColor,
      getSourceTypeIcon,
      getSourceTypeColor,
      isSelected,
      toggleSelection,
      hasSpeakers,
      getSpeakersList,
      openSourceDetail,
    };
  },
});
</script>

<style scoped>
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  margin: 0;
}

.empty-sources {
  text-align: center;
  padding: 32px;
  color: #666;
}

.empty-sources p {
  margin: 12px 0;
}

.sources-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.source-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;
  position: relative;
}

.source-card:hover {
  background: #f0f0f0;
  transform: translateX(4px);
}

.source-card:hover .chevron-icon {
  opacity: 1;
}

.chevron-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.2s;
  color: #999;
}

.source-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.source-info {
  flex: 1;
  min-width: 0;
}

.source-title {
  font-weight: 500;
  margin-bottom: 6px;
}

.source-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  flex-wrap: wrap;
}

/* Speaker Preview */
.speakers-preview {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.speaker-chip {
  font-weight: 500;
}

.speaker-chip.speaker-me {
  color: #1565c0;
}

.speaker-chip.speaker-contact {
  color: #2e7d32;
}

.source-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  margin-right: 20px;
}

.sources-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

/* Responsive */
@media (max-width: 600px) {
  .source-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .speakers-preview {
    margin-top: 4px;
  }
}
</style>
