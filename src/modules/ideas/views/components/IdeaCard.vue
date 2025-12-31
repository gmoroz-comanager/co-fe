<template>
  <v-card
    :to="{ name: 'IdeaDetail', params: { id: idea.documentId || idea.id } }"
    class="idea-card"
    hover
  >
    <v-card-title class="d-flex align-center">
      <v-badge
        :color="statusColor"
        dot
        class="mr-2"
      ></v-badge>
      <span class="text-truncate">{{ idea.title }}</span>
    </v-card-title>
    
    <v-card-subtitle class="d-flex align-center">
      <span>{{ formatDate(idea.createdAt) }}</span>
      <v-spacer></v-spacer>
      <v-chip
        v-if="idea.work_status === 'readyToPublish'"
        size="x-small"
        color="purple"
        variant="outlined"
      >
        <v-icon size="x-small" class="mr-1">mdi-sparkles</v-icon>
        Polished
      </v-chip>
    </v-card-subtitle>
    
    <v-card-text class="flex-grow-1">
      <!-- Brand Facet -->
      <div v-if="idea.brandFacet" class="mb-2">
        <v-chip size="x-small" color="purple" variant="tonal" class="mr-1">
          {{ idea.brandFacet }}
        </v-chip>
      </div>

      <!-- Recommended Channel -->
      <div v-if="idea.recommendedChannel" class="mb-2">
        <v-icon size="x-small" class="mr-1">mdi-pound</v-icon>
        <span class="text-caption">{{ idea.recommendedChannel }}</span>
      </div>
      
      <!-- Hook -->
      <div v-if="idea.question" class="mb-2 text-truncate">
        <strong>Hook:</strong> {{ idea.question }}
      </div>

      <!-- Short description -->
      <div v-if="idea.body" class="mb-2 text-body-2 text-grey-darken-1">
        {{ truncatedBody }}
      </div>
      
      <!-- Tags -->
      <div v-if="idea.tags" class="mt-2">
        <v-chip
          v-for="(tag, index) in parsedTags"
          :key="index"
          size="x-small"
          class="mr-1 mb-1"
        >
          {{ tag }}
        </v-chip>
      </div>
    </v-card-text>
    
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        variant="text"
        color="primary"
        size="small"
        :to="{ name: 'IdeaDetail', params: { id: idea.documentId || idea.id } }"
      >
        View Details
        <v-icon end>mdi-arrow-right</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import { formatDate } from '@/core/helpers/dateFormat';
import type { Idea } from '../../api/ideas.service';

export default defineComponent({
  name: 'IdeaCard',

  props: {
    idea: {
      type: Object as PropType<Idea>,
      required: true,
    },
  },

  setup(props) {
    const statusColor = computed(() => {
      switch (props.idea.work_status) {
        case 'new': return 'red';
        case 'readyToPublish': return 'orange';
        case 'published': return 'green';
        default: return 'grey';
      }
    });

    const parsedTags = computed(() => {
      if (!props.idea.tags) return [];
      return props.idea.tags.split(',').map(tag => tag.trim());
    });

    const truncatedBody = computed(() => {
      const text = props.idea.body;
      if (!text) return '';
      const maxLength = 100;
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    });

    return {
      formatDate,
      statusColor,
      parsedTags,
      truncatedBody,
    };
  },
});
</script>

<style scoped>
.idea-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: transform 0.2s, box-shadow 0.2s;
}

.idea-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
</style>

