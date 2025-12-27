<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-2">
      <div class="text-caption font-weight-bold text-medium-emphasis text-uppercase">Polished Ideas</div>
      <v-chip size="x-small" color="primary" variant="flat">{{ totalCount }}</v-chip>
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
      <!-- Ready to Publish ideas (large cards) -->
      <v-card
        v-for="idea in readyToPublishIdeas"
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

      <!-- Divider for scheduled section -->
      <div v-if="plannedIdeas.length > 0" class="scheduled-divider my-2">
        <v-divider></v-divider>
        <span class="text-caption text-medium-emphasis px-2 bg-background">Scheduled</span>
        <v-divider></v-divider>
      </div>

      <!-- Planned ideas (compact grey cards) -->
      <v-card
        v-for="idea in plannedIdeas"
        :key="idea.documentId"
        class="idea-card idea-card-planned"
        :class="{ 'idea-dragging': isDragging && draggedIdeaId === idea.documentId }"
        elevation="0"
        variant="outlined"
        color="grey-lighten-3"
        @mousedown="$emit('drag-start', $event, idea)"
      >
        <v-card-text class="pa-2 d-flex align-center">
          <v-icon size="x-small" color="grey" class="mr-2">mdi-calendar-check</v-icon>
          <div class="font-weight-medium text-caption text-truncate text-grey-darken-1 flex-grow-1">
            {{ idea.title }}
          </div>
          <v-icon size="x-small" color="grey-lighten-1">mdi-drag-vertical</v-icon>
        </v-card-text>
      </v-card>
      
      <div v-if="totalCount === 0" class="text-center text-medium-emphasis pa-4 text-body-2">
        No polished ideas found
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';
import { formatDate } from '@/core/helpers/dateFormat';

interface Idea {
  documentId: string;
  title: string;
  createdAt: string;
  polishedBody?: string;
  work_status?: 'new' | 'readyToPublish' | 'planned' | 'published';
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
    // Filter ideas by search term
    const filteredIdeas = computed(() => {
      if (!props.search) return props.ideas;
      const q = props.search.toLowerCase();
      return props.ideas.filter((i: Idea) => i.title.toLowerCase().includes(q));
    });

    // Ready to publish ideas (large cards at top)
    const readyToPublishIdeas = computed(() => {
      return filteredIdeas.value.filter(
        (i: Idea) => i.work_status === 'readyToPublish'
      );
    });

    // Planned ideas (compact grey cards at bottom)
    const plannedIdeas = computed(() => {
      return filteredIdeas.value.filter(
        (i: Idea) => i.work_status === 'planned'
      );
    });

    // Total count for the chip
    const totalCount = computed(() => {
      return readyToPublishIdeas.value.length + plannedIdeas.value.length;
    });
    
    return {
      readyToPublishIdeas,
      plannedIdeas,
      totalCount,
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

/* Planned ideas - compact style */
.idea-card-planned {
  background-color: rgb(var(--v-theme-grey-lighten-4)) !important;
  border-color: rgb(var(--v-theme-grey-lighten-2)) !important;
}
.idea-card-planned:hover {
  transform: translateY(-1px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
}

/* Scheduled section divider */
.scheduled-divider {
  display: flex;
  align-items: center;
  gap: 8px;
}
.scheduled-divider .v-divider {
  flex: 1;
}
.scheduled-divider span {
  white-space: nowrap;
}
</style>
