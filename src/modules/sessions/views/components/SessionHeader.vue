<template>
  <header class="session-header">
    <div class="header-top">
      <v-btn
        variant="text"
        prepend-icon="mdi-arrow-left"
        @click="$emit('back')"
      >
        Back to Sessions
      </v-btn>
    </div>

    <div class="header-main" v-if="session">
      <div class="header-info">
        <h1>{{ session.title || 'Untitled Session' }}</h1>
        <div class="header-meta">
          <span v-if="session.date_start">
            {{ formatDateTime(session.date_start) }}
            <span v-if="session.date_end"> - {{ formatDateTime(session.date_end) }}</span>
          </span>
          <v-chip
            :color="getStatusColor(session.work_status)"
            size="small"
            label
            class="ml-3"
          >
            {{ session.work_status }}
          </v-chip>
        </div>
      </div>

      <div class="header-stats">
        <div class="stat">
          <span class="stat-value">{{ session.audio_sources?.length || 0 }}</span>
          <span class="stat-label">Sources</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ session.ideas?.length || 0 }}</span>
          <span class="stat-label">Ideas</span>
        </div>
      </div>

      <div class="header-actions">
        <v-btn
          v-if="canProcess"
          color="success"
          prepend-icon="mdi-play"
          @click="$emit('process')"
          :loading="processing"
        >
          Process
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-upload"
          @click="$emit('upload')"
        >
          Add Files
        </v-btn>
      </div>
    </div>

    <!-- Processing Progress -->
    <div v-if="session?.work_status === 'processing' && processingProgress" class="processing-bar">
      <div class="progress-info">
        <span>Processing: {{ processingProgress.completed }}/{{ processingProgress.total }} sources</span>
        <span v-if="processingProgress.transcribing > 0">
          ({{ processingProgress.transcribing }} transcribing)
        </span>
        <span v-if="processingProgress.summarizing > 0">
          ({{ processingProgress.summarizing }} summarizing)
        </span>
      </div>
      <v-progress-linear
        :model-value="processingProgress.percent"
        color="primary"
        height="8"
        rounded
      />
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Session, ProcessingStatus } from '../../api/sessions.service';

interface ProcessingProgress {
  percent: number;
  transcribing: number;
  summarizing: number;
  completed: number;
  failed: number;
  total: number;
}

export default defineComponent({
  name: 'SessionHeader',

  props: {
    session: {
      type: Object as PropType<Session | null>,
      default: null,
    },
    processing: {
      type: Boolean,
      default: false,
    },
    processingProgress: {
      type: Object as PropType<ProcessingProgress | null>,
      default: null,
    },
    canProcess: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['back', 'process', 'upload'],

  setup() {
    const formatDateTime = (dateStr: string) => {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const getStatusColor = (status: string) => {
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

    return {
      formatDateTime,
      getStatusColor,
    };
  },
});
</script>

<style scoped>
.session-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 16px 24px;
}

.header-top {
  margin-bottom: 12px;
}

.header-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.header-info h1 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
}

.header-meta {
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.header-stats {
  display: flex;
  gap: 32px;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #1976d2;
}

.stat-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* Processing Bar */
.processing-bar {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.progress-info {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

/* Responsive */
@media (max-width: 768px) {
  .header-main {
    flex-direction: column;
  }

  .header-stats {
    order: -1;
  }
}
</style>

