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
          label="Search sessions..."
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

      <!-- Participant Filter -->
      <div class="filter-group">
        <label class="filter-label">Participant</label>
        <v-select
          :model-value="participantFilter"
          :items="participantOptions"
          item-title="title"
          item-value="value"
          variant="outlined"
          density="compact"
          hide-details
          @update:model-value="$emit('update:participantFilter', $event)"
        />
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
import { defineComponent, PropType, ref, computed } from 'vue';

interface Contact {
  id: number;
  documentId: string;
  name: string;
}

export default defineComponent({
  name: 'SessionsFilterSidebar',

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
    participantFilter: {
      type: String,
      default: '',
    },
    contacts: {
      type: Array as PropType<Contact[]>,
      default: () => [],
    },
  },

  emits: [
    'toggle-collapse',
    'update:searchQuery',
    'update:dateRange',
    'update:statusFilter',
    'update:participantFilter',
    'clear-filters',
  ],

  setup(props, { emit }) {
    const dateMenuOpen = ref(false);

    const statusOptions = [
      { title: 'Any', value: '' },
      { title: 'Draft', value: 'draft' },
      { title: 'Processing', value: 'processing' },
      { title: 'Ready', value: 'ready' },
      { title: 'Error', value: 'error' },
    ];

    // Build participant options with "Any" as the first option
    const participantOptions = computed(() => {
      const anyOption = { title: 'Any', value: '' };
      const contactOptions = props.contacts.map(contact => ({
        title: contact.name,
        value: contact.documentId,
      }));
      return [anyOption, ...contactOptions];
    });

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
      participantOptions,
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

