<template>
  <section class="content-section ideas-section">
    <div class="section-header">
      <h2>Ideas ({{ ideas.length }})</h2>
    </div>

    <div v-if="!ideas.length" class="empty-ideas">
      <v-icon size="48" color="grey-lighten-1">mdi-lightbulb-outline</v-icon>
      <p>No ideas generated yet</p>
      <p class="hint">Process the session and use "Send to Content" to generate ideas</p>
    </div>

    <div v-else class="ideas-list">
      <div
        v-for="idea in ideas"
        :key="idea.documentId"
        class="idea-card"
        @click="$emit('open-idea', idea.documentId)"
      >
        <div class="idea-header">
          <h4>{{ idea.title }}</h4>
          <v-chip v-if="idea.recommendedChannel" size="x-small" label>
            {{ idea.recommendedChannel }}
          </v-chip>
        </div>
        <p v-if="idea.body" class="idea-body">{{ truncate(idea.body, 150) }}</p>
        <div class="idea-footer">
          <v-chip size="x-small" :color="getIdeaStatusColor(idea.work_status)">
            {{ idea.work_status || 'new' }}
          </v-chip>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Idea } from '../../api/sessions.service';

export default defineComponent({
  name: 'SessionIdeas',

  props: {
    ideas: {
      type: Array as PropType<Idea[]>,
      default: () => [],
    },
  },

  emits: ['open-idea'],

  setup() {
    const getIdeaStatusColor = (status?: string) => {
      switch (status) {
        case 'readyToPublish':
          return 'success';
        case 'planned':
          return 'info';
        case 'published':
          return 'primary';
        default:
          return 'grey';
      }
    };

    const truncate = (text: string, length: number) => {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    };

    return {
      getIdeaStatusColor,
      truncate,
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

.empty-ideas {
  text-align: center;
  padding: 32px;
  color: #666;
}

.empty-ideas p {
  margin: 12px 0;
}

.hint {
  font-size: 13px;
  color: #999;
}

.ideas-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.idea-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.idea-card:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
}

.idea-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.idea-header h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
}

.idea-body {
  font-size: 13px;
  color: #666;
  margin: 0 0 12px;
  line-height: 1.5;
}

.idea-footer {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .ideas-list {
    grid-template-columns: 1fr;
  }
}
</style>

