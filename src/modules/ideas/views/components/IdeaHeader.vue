<template>
  <div class="idea-header">
    <!-- Breadcrumbs -->
    <PageBreadcrumbs :items="breadcrumbs" />

    <!-- Header Card -->
    <div class="header-card">
      <div class="header-main">
        <div class="header-info">
          <EditableText
            :model-value="idea.title"
            display-tag="h1"
            display-class="idea-title"
            label="Title"
            placeholder="Enter idea title..."
            :saving="titleSaving"
            @save="onTitleSave"
          >
            <template #display>
              <h1 class="idea-title">{{ idea.title }}</h1>
            </template>
          </EditableText>
          <div class="header-meta">
            <v-chip
              :color="getStatusColor(idea.work_status || 'new')"
              size="small"
              label
              class="mr-2"
            >
              {{ idea.work_status || 'new' }}
            </v-chip>
            <span class="text-caption text-grey">
              Created: {{ formatDate(idea.createdAt) }}
            </span>
          </div>
        </div>

        <div class="header-actions">
          <v-btn
            color="grey"
            variant="outlined"
            prepend-icon="mdi-arrow-left"
            @click="goBack"
          >
            Back to List
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import { useRouter } from 'vue-router';
import { PageBreadcrumbs } from '@/core/components';
import type { BreadcrumbItem } from '@/core/components/types';
import { formatDateTime } from '@/core/helpers/dateFormat';
import { Idea } from '../../api/ideas.service';
import EditableText from './EditableText.vue';

export default defineComponent({
  name: 'IdeaHeader',

  components: {
    PageBreadcrumbs,
    EditableText,
  },

  props: {
    idea: {
      type: Object as PropType<Idea>,
      required: true,
    },
    titleSaving: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:title'],

  setup(props, { emit }) {
    const router = useRouter();

    const breadcrumbs = computed((): BreadcrumbItem[] => {
      const items: BreadcrumbItem[] = [];

      // Always start with Home
      items.push({
        title: 'Sessions',
        to: '/sessions',
        icon: 'mdi-home',
      });

      // If idea has a session, show session path
      if (props.idea?.session) {
        items.push({
          title: props.idea.session.title || 'Session',
          to: `/sessions/${props.idea.session.documentId}`,
        });

        // Ideas (context)
        items.push({
          title: 'Ideas',
          disabled: true,
        });
      } else {
        // No session - show Ideas list
        items.push({
          title: 'Ideas',
          to: '/ideas',
        });
      }

      // Current idea (disabled, current page)
      items.push({
        title: props.idea?.title || 'Idea',
        disabled: true,
      });

      return items;
    });

    const formatDate = (dateString: string): string => {
      return formatDateTime(dateString);
    };

    const getStatusColor = (status: string): string => {
      switch (status) {
        case 'new':
          return 'red';
        case 'readyToPublish':
          return 'orange';
        case 'published':
          return 'green';
        default:
          return 'grey';
      }
    };

    const goBack = () => {
      if (props.idea?.session?.documentId) {
        router.push(`/sessions/${props.idea.session.documentId}`);
      } else {
        router.push('/ideas');
      }
    };

    const onTitleSave = (newTitle: string) => {
      emit('update:title', newTitle);
    };

    return {
      breadcrumbs,
      formatDate,
      getStatusColor,
      goBack,
      onTitleSave,
    };
  },
});
</script>

<style scoped>
.idea-header {
  background: #f5f5f5;
}

.header-card {
  background: white;
  padding: 24px;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-info {
  flex: 1;
  min-width: 0;
}

.header-info :deep(.idea-title) {
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 700;
  word-break: break-word;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .header-main {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .v-btn {
    width: 100%;
  }
}
</style>
