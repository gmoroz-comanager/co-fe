<template>
  <div class="ideas-page">
    <!-- Sidebar Filters -->
    <IdeasFilterSidebar
      :is-collapsed="sidebarCollapsed"
      :search-query="searchQuery"
      :date-range="dateRange"
      :status-filter="statusFilter"
      :sort-order="sortOrder"
      @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
      @update:search-query="onFilterChange('search', $event)"
      @update:date-range="onFilterChange('dateRange', $event)"
      @update:status-filter="onFilterChange('status', $event)"
      @update:sort-order="onFilterChange('sortOrder', $event)"
      @clear-filters="clearFilters"
    />

    <!-- Main Content -->
    <main class="ideas-content">
      <!-- Header -->
      <div class="ideas-header">
        <h1>Ideas Catalog</h1>
        <div class="header-info">
          <v-chip v-if="pagination.total > 0" variant="tonal" size="small">
            {{ pagination.total }} ideas
          </v-chip>
        </div>
      </div>

      <!-- Error State -->
      <v-alert 
        v-if="error" 
        type="error" 
        closable 
        class="mb-4"
        @click:close="clearError"
      >
        {{ error }}
      </v-alert>

      <!-- Loading State -->
      <v-progress-linear
        v-if="loading"
        indeterminate
        color="primary"
        class="mb-4"
      />

      <!-- Background Loading Indicator -->
      <v-progress-linear
        v-else-if="backgroundLoading"
        indeterminate
        color="primary"
        height="2"
        class="mb-4"
      />

      <!-- Empty State -->
      <div v-if="!loading && ideas.length === 0" class="empty-state">
        <v-icon size="64" color="grey-lighten-1">mdi-lightbulb-outline</v-icon>
        <p>No ideas found matching your criteria.</p>
        <v-btn color="primary" variant="text" @click="clearFilters">
          Clear Filters
        </v-btn>
      </div>

      <!-- Ideas Grid -->
      <div v-else class="ideas-grid">
        <v-card
          v-for="idea in ideas"
          :key="idea.id"
          :to="{ name: 'IdeaDetail', params: { id: idea.documentId || idea.id } }"
          class="idea-card"
          hover
        >
          <v-card-title class="d-flex align-center">
            <v-badge
              :color="getStatusColor(idea.work_status)"
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
              {{ truncateText(idea.body, 100) }}
            </div>
            
            <!-- Tags -->
            <div v-if="idea.tags" class="mt-2">
              <v-chip
                v-for="(tag, index) in parseTags(idea.tags)"
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
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pageCount > 1" class="pagination-container">
        <v-pagination
          :model-value="pagination.page"
          :length="pagination.pageCount"
          :total-visible="7"
          rounded="circle"
          @update:model-value="onPageChange"
        />
        <span class="pagination-info">
          {{ pagination.total }} ideas total
        </span>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { debounce } from 'lodash';
import { formatDate } from '@/core/helpers/dateFormat';
import IdeasFilterSidebar from './components/IdeasFilterSidebar.vue';

export default defineComponent({
  name: 'IdeasList',

  components: {
    IdeasFilterSidebar,
  },

  setup() {
    const store = useStore();

    // Sidebar state
    const sidebarCollapsed = ref(false);

    // Filter state (local for immediate UI updates)
    const searchQuery = ref('');
    const dateRange = ref<Date[]>([]);
    const statusFilter = ref('');
    const sortOrder = ref<'asc' | 'desc'>('desc');

    // Computed from store
    const ideas = computed(() => store.getters['ideas/allIdeas']);
    const loading = computed(() => store.getters['ideas/isLoading']);
    const backgroundLoading = computed(() => store.getters['ideas/isBackgroundLoading']);
    const error = computed(() => store.state.ideas.error);
    const pagination = computed(() => store.getters['ideas/pagination']);

    // Debounced filter application
    let filterTimeout: number | null = null;
    const DEBOUNCE_DELAY = 500;

    const applyFilters = async () => {
      let startDate: string | undefined;
      let endDate: string | undefined;

      if (dateRange.value.length === 1) {
        // Single date selected - use same date for start and end
        startDate = dateRange.value[0].toISOString().split('T')[0];
        endDate = startDate;
      } else if (dateRange.value.length >= 2) {
        const sortedDates = [...dateRange.value].sort((a, b) => a.getTime() - b.getTime());
        startDate = sortedDates[0].toISOString().split('T')[0];
        endDate = sortedDates[sortedDates.length - 1].toISOString().split('T')[0];
      }

      const filtersPayload = {
        searchTerm: searchQuery.value || undefined,
        startDate,
        endDate,
        workStatus: statusFilter.value || undefined,
        sortBy: 'createdAt' as const,
        sortOrder: sortOrder.value,
        page: 1,
        pageSize: 12,
      };
      
      console.log('[IdeasList] applyFilters:', filtersPayload);
      await store.dispatch('ideas/updateFilters', filtersPayload);
    };

    const debouncedApplyFilters = () => {
      if (filterTimeout) clearTimeout(filterTimeout);
      filterTimeout = window.setTimeout(() => {
        applyFilters();
      }, DEBOUNCE_DELAY);
    };

    // Universal handler for all filter changes
    const onFilterChange = (filterType: string, value: any) => {
      console.log(`[IdeasList] Filter changed: ${filterType} =`, value);

      switch (filterType) {
        case 'search':
          searchQuery.value = value || '';
          break;
        case 'dateRange':
          dateRange.value = value || [];
          break;
        case 'status':
          statusFilter.value = value || '';
          break;
        case 'sortOrder':
          sortOrder.value = value;
          break;
      }

      debouncedApplyFilters();
    };

    // Pagination handler
    const onPageChange = (page: number) => {
      store.dispatch('ideas/updateFilters', {
        ...store.getters['ideas/filters'],
        page,
      });
    };

    const clearFilters = async () => {
      if (filterTimeout) clearTimeout(filterTimeout);

      searchQuery.value = '';
      dateRange.value = [];
      statusFilter.value = '';
      sortOrder.value = 'desc';

      await store.dispatch('ideas/resetFilters');
    };

    const clearError = () => {
      store.commit('ideas/SET_ERROR', null);
    };

    // Helper methods
    const getStatusColor = (status: string | undefined) => {
      switch (status) {
        case 'new': return 'red';
        case 'readyToPublish': return 'orange';
        case 'published': return 'green';
        default: return 'grey';
      }
    };

    const parseTags = (tagsString: string | undefined) => {
      if (!tagsString) return [];
      return tagsString.split(',').map(tag => tag.trim());
    };

    const truncateText = (text: string | undefined, maxLength: number) => {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };

    // Fetch ideas on component mount
    onMounted(() => {
      store.dispatch('ideas/fetchIdeas');
    });

    return {
      // State
      sidebarCollapsed,
      searchQuery,
      dateRange,
      statusFilter,
      sortOrder,

      // Computed
      ideas,
      loading,
      backgroundLoading,
      error,
      pagination,

      // Methods
      onFilterChange,
      onPageChange,
      clearFilters,
      clearError,
      formatDate,
      getStatusColor,
      parseTags,
      truncateText,
    };
  },
});
</script>

<style scoped>
.ideas-page {
  display: flex;
  min-height: calc(100vh - 64px);
  background: #f5f5f5;
}

/* Main Content */
.ideas-content {
  flex: 1;
  padding: 24px;
  overflow-x: auto;
}

.ideas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.ideas-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Ideas Grid */
.ideas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

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

/* Empty State */
.empty-state {
  padding: 64px 24px;
  text-align: center;
  color: #666;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-state p {
  margin: 16px 0 24px;
  font-size: 16px;
}

/* Pagination */
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px 0;
  margin-top: 24px;
}

.pagination-info {
  color: #666;
  font-size: 13px;
}

/* Responsive */
@media (max-width: 1024px) {
  .ideas-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .ideas-grid {
    grid-template-columns: 1fr;
  }
}
</style>
