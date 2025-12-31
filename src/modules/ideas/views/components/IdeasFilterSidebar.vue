<template>
  <aside class="filters-sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <h3 v-if="!isCollapsed">Filters</h3>
      <v-btn
        icon
        variant="text"
        size="small"
        @click="$emit('toggle-collapse')"
      >
        <v-icon>{{ isCollapsed ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
      </v-btn>
    </div>

    <div v-if="!isCollapsed" class="filters-content">
      <!-- Search -->
      <div class="filter-group">
        <v-text-field
          :model-value="searchQuery"
          label="Search ideas..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          @update:model-value="$emit('update:searchQuery', $event)"
        />
      </div>

      <!-- Date Range -->
      <div class="filter-group">
        <label class="filter-label">Date Range</label>
        <v-date-input
          :model-value="dateRange"
          label="Select range"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          multiple="range"
          prepend-icon=""
          prepend-inner-icon="mdi-calendar"
          :menu="dateMenuOpen"
          @update:model-value="handleDateRangeChange"
          @update:menu="dateMenuOpen = $event"
        />
      </div>

      <!-- Status Filter -->
      <div class="filter-group">
        <label class="filter-label">Status</label>
        <v-select
          :model-value="statusFilter"
          :items="statusOptions"
          variant="outlined"
          density="compact"
          hide-details
          @update:model-value="$emit('update:statusFilter', $event)"
        />
      </div>

      <!-- Sort Order -->
      <div class="filter-group">
        <label class="filter-label">Sort Order</label>
        <v-btn-toggle
          :model-value="sortOrder"
          mandatory
          density="compact"
          class="sort-toggle"
          @update:model-value="$emit('update:sortOrder', $event)"
        >
          <v-btn value="desc" size="small">
            <v-icon size="small" class="mr-1">mdi-sort-descending</v-icon>
            Newest
          </v-btn>
          <v-btn value="asc" size="small">
            <v-icon size="small" class="mr-1">mdi-sort-ascending</v-icon>
            Oldest
          </v-btn>
        </v-btn-toggle>
      </div>

      <!-- Clear Filters Button -->
      <v-btn
        variant="text"
        block
        class="mt-4"
        @click="$emit('clear-filters')"
      >
        Clear All
      </v-btn>
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

export default defineComponent({
  name: 'IdeasFilterSidebar',

  props: {
    isCollapsed: {
      type: Boolean,
      default: false,
    },
    searchQuery: {
      type: String,
      default: '',
    },
    dateRange: {
      type: Array as PropType<Date[]>,
      default: () => [],
    },
    statusFilter: {
      type: String,
      default: '',
    },
    sortOrder: {
      type: String as PropType<'asc' | 'desc'>,
      default: 'desc',
    },
  },

  emits: [
    'toggle-collapse',
    'update:searchQuery',
    'update:dateRange',
    'update:statusFilter',
    'update:sortOrder',
    'clear-filters',
  ],

  setup(_, { emit }) {
    const dateMenuOpen = ref(false);

    const statusOptions = [
      { title: 'Any', value: '' },
      { title: 'New', value: 'new' },
      { title: 'Ready to Publish', value: 'readyToPublish' },
      { title: 'Planned', value: 'planned' },
      { title: 'Published', value: 'published' },
    ];

    const handleDateRangeChange = (value: Date[] | null) => {
      emit('update:dateRange', value || []);
      
      // Auto-close calendar when range is complete (2 dates selected)
      if (value && value.length >= 2) {
        dateMenuOpen.value = false;
      }
    };

    return {
      dateMenuOpen,
      statusOptions,
      handleDateRangeChange,
    };
  },
});
</script>

<style scoped>
.filters-sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 16px;
  transition: width 0.3s ease;
  flex-shrink: 0;
}

.filters-sidebar.collapsed {
  width: 56px;
  padding: 16px 8px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.filter-group {
  margin-bottom: 16px;
}

.filter-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sort-toggle {
  width: 100%;
}

.sort-toggle .v-btn {
  flex: 1;
}

/* Responsive */
@media (max-width: 1024px) {
  .filters-sidebar {
    position: fixed;
    left: 0;
    top: 64px;
    bottom: 0;
    z-index: 100;
    transform: translateX(-100%);
  }

  .filters-sidebar:not(.collapsed) {
    transform: translateX(0);
    box-shadow: 4px 0 12px rgba(0, 0, 0, 0.1);
  }
}
</style>

