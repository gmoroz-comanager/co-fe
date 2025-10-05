<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 mb-6">Ideas Catalog</h1>
      </v-col>
    </v-row>

    <!-- Filters Section -->
    <v-row>
      <v-col cols="12">
        <v-card class="mb-6">
          <v-card-title>
            Filters
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              variant="text"
              @click="resetFilters"
              :disabled="loading"
            >
              Reset Filters
            </v-btn>
          </v-card-title>
          
          <v-card-text>
            <v-row>
              <!-- Search Term -->
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="filters.searchTerm"
                  label="Search"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  @update:model-value="debouncedSearch"
                  prepend-inner-icon="mdi-magnify"
                ></v-text-field>
              </v-col>
              
              <!-- Status Filter -->
              <v-col cols="12" md="4">
                <v-select
                  v-model="filters.workStatus"
                  :items="statusOptions"
                  label="Status"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  @update:model-value="applyFilters"
                ></v-select>
              </v-col>
              
              <!-- Sort Order -->
              <v-col cols="12" md="4">
                <v-select
                  v-model="filters.sort"
                  :items="sortOptions"
                  label="Sort By"
                  variant="outlined"
                  density="compact"
                  hide-details
                  @update:model-value="applyFilters"
                ></v-select>
              </v-col>
            </v-row>
            
            <v-row class="mt-4">
              <!-- Date Range -->
              <v-col cols="12" md="6">
                <v-menu
                  v-model="startDateMenu"
                  :close-on-content-click="false"
                >
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-model="startDateFormatted"
                      label="From Date"
                      prepend-inner-icon="mdi-calendar"
                      readonly
                      v-bind="props"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                      @click:clear="clearStartDate"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="startDate"
                    @update:model-value="startDateMenu = false; updateStartDate()"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-menu
                  v-model="endDateMenu"
                  :close-on-content-click="false"
                >
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-model="endDateFormatted"
                      label="To Date"
                      prepend-inner-icon="mdi-calendar"
                      readonly
                      v-bind="props"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                      @click:clear="clearEndDate"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="endDate"
                    @update:model-value="endDateMenu = false; updateEndDate()"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-col>
    </v-row>

    <!-- Error State -->
    <v-row v-else-if="error">
      <v-col cols="12">
        <v-alert type="error">{{ error }}</v-alert>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-row v-else-if="ideas.length === 0">
      <v-col cols="12" class="text-center">
        <v-alert type="info" variant="tonal">
          No ideas found matching your criteria.
        </v-alert>
      </v-col>
    </v-row>

    <!-- Ideas List -->
    <v-row v-else>
      <v-col
        v-for="idea in ideas"
        :key="idea.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card
          :to="{ name: 'IdeaDetail', params: { id: idea.documentId } }"
          height="100%"
          class="d-flex flex-column"
        >
          <v-card-title class="d-flex align-center">
            <v-badge
              :color="getStatusColor(idea.work_status)"
              dot
              class="mr-2"
            ></v-badge>
            {{ idea.title }}
          </v-card-title>
          
          <v-card-subtitle>
            {{ formatDate(idea.createdAt) }}
          </v-card-subtitle>
          
          <v-card-text class="flex-grow-1">
            <div v-if="idea.question" class="mb-2 text-truncate">
              <strong>Question:</strong> {{ idea.question }}
            </div>
            
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
              :to="{ name: 'IdeaDetail', params: { id: idea.id } }"
            >
              View Details
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Pagination -->
    <v-row v-if="ideas.length > 0">
      <v-col cols="12" class="d-flex justify-center mt-4">
        <v-pagination
          v-model="currentPage"
          :length="pagination.pageCount"
          :total-visible="7"
          @update:model-value="changePage"
        ></v-pagination>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { IdeaFilters } from '../api/ideas.service';
import { debounce } from 'lodash';

export default defineComponent({
  name: 'IdeasList',
  
  setup() {
    const store = useStore();
    
    // State
    const startDate = ref<string | null>(null);
    const endDate = ref<string | null>(null);
    const startDateMenu = ref(false);
    const endDateMenu = ref(false);
    const startDateFormatted = ref('');
    const endDateFormatted = ref('');
    const currentPage = ref(1);
    
    // Computed
    const ideas = computed(() => store.getters['ideas/allIdeas']);
    const loading = computed(() => store.getters['ideas/isLoading']);
    const error = computed(() => store.state.ideas.error);
    const filters = computed(() => store.getters['ideas/filters']);
    const pagination = computed(() => store.getters['ideas/pagination']);
    
    // Options for select fields
    const statusOptions = [
      { title: 'New', value: 'new' },
      { title: 'Ready to Publish', value: 'readyToPublish' },
      { title: 'Published', value: 'published' }
    ];
    
    const sortOptions = [
      { title: 'Newest First', value: 'createdAt:desc' },
      { title: 'Oldest First', value: 'createdAt:asc' },
      { title: 'Title (A-Z)', value: 'title:asc' },
      { title: 'Title (Z-A)', value: 'title:desc' }
    ];
    
    // Methods
    const fetchIdeas = () => {
      store.dispatch('ideas/fetchIdeas');
    };
    
    const applyFilters = () => {
      currentPage.value = 1; // Reset to first page when filters change
      store.dispatch('ideas/updateFilters', { 
        ...filters.value,
        page: 1
      });
    };
    
    const debouncedSearch = debounce(() => {
      applyFilters();
    }, 500);
    
    const resetFilters = () => {
      startDate.value = null;
      endDate.value = null;
      startDateFormatted.value = '';
      endDateFormatted.value = '';
      currentPage.value = 1;
      store.dispatch('ideas/resetFilters');
    };
    
    const changePage = (page: number) => {
      store.dispatch('ideas/updateFilters', { 
        ...filters.value,
        page
      });
    };
    
    const updateStartDate = () => {
      if (startDate.value) {
        startDateFormatted.value = formatDateYMD(startDate.value);
        store.dispatch('ideas/updateFilters', { 
          ...filters.value,
          startDate: startDate.value 
        });
      }
    };
    
    const updateEndDate = () => {
      if (endDate.value) {
        endDateFormatted.value = formatDateYMD(endDate.value);
        store.dispatch('ideas/updateFilters', { 
          ...filters.value,
          endDate: endDate.value 
        });
      }
    };
    
    const clearStartDate = () => {
      startDate.value = null;
      startDateFormatted.value = '';
      store.dispatch('ideas/updateFilters', { 
        ...filters.value,
        startDate: undefined 
      });
    };
    
    const clearEndDate = () => {
      endDate.value = null;
      endDateFormatted.value = '';
      store.dispatch('ideas/updateFilters', { 
        ...filters.value,
        endDate: undefined 
      });
    };
    
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    };
    
    const formatDateYMD = (dateString: string) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    };
    
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
    
    // Watch for page changes from pagination component
    watch(currentPage, (newPage) => {
      if (newPage !== filters.value.page) {
        changePage(newPage);
      }
    });
    
    // Watch for page changes from store
    watch(() => pagination.value.page, (newPage) => {
      currentPage.value = newPage;
    });
    
    // Fetch ideas on component mount
    onMounted(() => {
      fetchIdeas();
    });
    
    return {
      ideas,
      loading,
      error,
      filters,
      pagination,
      statusOptions,
      sortOptions,
      startDate,
      endDate,
      startDateMenu,
      endDateMenu,
      startDateFormatted,
      endDateFormatted,
      currentPage,
      fetchIdeas,
      applyFilters,
      debouncedSearch,
      resetFilters,
      changePage,
      updateStartDate,
      updateEndDate,
      clearStartDate,
      clearEndDate,
      formatDate,
      getStatusColor,
      parseTags
    };
  }
});
</script>

<style scoped>
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
</style>
