<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-2">
      <div class="text-caption font-weight-bold text-medium-emphasis text-uppercase">Polished Ideas</div>
      <v-chip size="x-small" color="primary" variant="flat">{{ filteredIdeas.length }}</v-chip>
    </div>
    
    <v-text-field
      :model-value="search"
      @update:model-value="$emit('update:search', $event)"
      prepend-inner-icon="mdi-magnify"
      placeholder="Search ideas..."
      density="compact"
      variant="outlined"
      hide-details
      class="mb-4"
      bg-color="surface"
    ></v-text-field>

    <div v-if="loading" class="d-flex justify-center py-4">
      <v-progress-circular indeterminate size="24" color="primary"></v-progress-circular>
    </div>

    <div v-else class="d-flex flex-column gap-2">
      <v-card
        v-for="idea in filteredIdeas"
        :key="idea.documentId"
        class="idea-card"
        :class="{ 'idea-dragging': isDragging && draggedIdeaId === idea.documentId }"
        elevation="1"
        border
        @mousedown="$emit('drag-start', $event, idea)"
      >
        <v-card-text class="pa-3">
          <div class="font-weight-medium text-body-2 text-truncate mb-1">{{ idea.title }}</div>
          <div class="d-flex align-center justify-space-between">
            <div class="text-caption text-medium-emphasis">{{ formatDate(idea.createdAt) }}</div>
            <v-icon size="small" color="grey-lighten-1">mdi-drag-vertical</v-icon>
          </div>
        </v-card-text>
      </v-card>
      
      <div v-if="filteredIdeas.length === 0" class="text-center text-medium-emphasis pa-4 text-body-2">
        No polished ideas found
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';

interface Idea {
  documentId: string;
  title: string;
  createdAt: string;
  polishedBody?: string;
}

export default defineComponent({
  name: 'IdeasSidebar',
  
  props: {
    ideas: {
      type: Array as PropType<Idea[]>,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    search: {
      type: String,
      default: '',
    },
    isDragging: {
      type: Boolean,
      default: false,
    },
    draggedIdeaId: {
      type: String as PropType<string | null>,
      default: null,
    },
  },
  
  emits: ['update:search', 'drag-start'],
  
  setup(props) {
    const filteredIdeas = computed(() => {
      if (!props.search) return props.ideas;
      const q = props.search.toLowerCase();
      return props.ideas.filter((i: Idea) => i.title.toLowerCase().includes(q));
    });
    
    const formatDate = (date: string) => new Date(date).toLocaleDateString();
    
    return {
      filteredIdeas,
      formatDate,
    };
  },
});
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
.idea-card {
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
  user-select: none;
  cursor: grab;
}
.idea-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}
.idea-card:active {
  cursor: grabbing;
}
.idea-dragging {
  opacity: 0.4;
  transform: scale(0.98);
}
</style>

