<template>
  <div class="sessions-page">
    <!-- Sidebar Filters -->
    <SessionsFilterSidebar
      :is-collapsed="sidebarCollapsed"
      :search-query="searchQuery"
      :date-range="dateRange"
      :status-filter="statusFilter"
      :participant-filter="participantFilter"
      :contacts="contacts"
      @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
      @update:search-query="onFilterChange('search', $event)"
      @update:date-range="onFilterChange('dateRange', $event)"
      @update:status-filter="onFilterChange('status', $event)"
      @update:participant-filter="onFilterChange('participant', $event)"
      @clear-filters="clearFilters"
    />

    <!-- Main Content -->
    <main class="sessions-content">
      <!-- Header -->
      <div class="sessions-header">
        <h1>Sessions</h1>
        <div class="header-actions">
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="showCreateDialog = true"
          >
            New Session
          </v-btn>
        </div>
      </div>

      <!-- Loading State -->
      <v-progress-linear
        v-if="loading"
        indeterminate
        color="primary"
        class="mb-4"
      />

      <!-- Sessions Table -->
      <div class="sessions-table" v-if="!loading">
        <!-- Table Header -->
        <div class="table-header">
          <div class="col-date sortable-header" @click="toggleDateSort">
            <span>Date</span>
            <v-icon size="16" class="sort-icon">
              {{ sortOrder === 'desc' ? 'mdi-arrow-down' : 'mdi-arrow-up' }}
            </v-icon>
          </div>
          <div class="col-title">Title</div>
          <div class="col-participants">Participants</div>
          <div class="col-sources">Sources</div>
          <div class="col-status">Status</div>
          <div class="col-expand"></div>
        </div>

        <!-- Empty State -->
        <div v-if="sessions.length === 0" class="empty-state">
          <v-icon size="64" color="grey-lighten-1">mdi-folder-open-outline</v-icon>
          <p>No sessions found</p>
          <v-btn color="primary" @click="showCreateDialog = true">
            Create your first session
          </v-btn>
        </div>

        <!-- Session Rows -->
        <div
          v-for="session in sessions"
          :key="session.documentId"
          class="session-row-wrapper"
        >
          <!-- Collapsed Row -->
          <div
            class="session-row"
            :class="{ expanded: expandedSessions.has(session.documentId) }"
            @click="toggleSession(session.documentId)"
          >
            <div class="col-date">
              {{ formatDate(session.createdAt) }}
            </div>
            <div class="col-title">
              {{ session.title || 'Untitled Session' }}
            </div>
            <div class="col-participants">
              {{ session.participants?.length || 0 }}
            </div>
            <div class="col-sources">
              {{ session.audio_sources?.length || 0 }}
            </div>
            <div class="col-status">
              <v-chip
                :color="getStatusColor(session.work_status)"
                size="small"
                label
              >
                {{ session.work_status }}
              </v-chip>
            </div>
            <div class="col-expand">
              <v-icon>
                {{ expandedSessions.has(session.documentId) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
              </v-icon>
            </div>
          </div>

          <!-- Expanded Card -->
          <transition name="expand">
            <div
              v-if="expandedSessions.has(session.documentId)"
              class="session-expanded"
            >
              <!-- Summary -->
              <div class="expanded-section" v-if="session.summary">
                <h4>Summary</h4>
                <p class="summary-text">{{ session.summary }}</p>
              </div>

              <!-- Narratives -->
              <div class="expanded-section" v-if="session.narratives?.length">
                <h4>Narratives</h4>
                <div class="narratives-list">
                  <div
                    v-for="(narrative, idx) in session.narratives"
                    :key="idx"
                    class="narrative-item"
                  >
                    <span class="narrative-title">{{ narrative.title }}</span>
                    <span class="narrative-percent">{{ narrative.percent }}%</span>
                  </div>
                </div>
              </div>

              <!-- Sources Preview -->
              <div class="expanded-section" v-if="session.audio_sources?.length">
                <h4>Sources ({{ session.audio_sources.length }})</h4>
                <div class="sources-preview">
                  <div
                    v-for="source in session.audio_sources.slice(0, 3)"
                    :key="source.documentId"
                    class="source-chip"
                  >
                    <v-icon size="small" class="mr-1">mdi-microphone</v-icon>
                    {{ source.title || 'Untitled' }}
                  </div>
                  <span v-if="session.audio_sources.length > 3" class="more-sources">
                    +{{ session.audio_sources.length - 3 }} more
                  </span>
                </div>
              </div>

              <!-- Artifacts -->
              <div class="expanded-section artifacts">
                <div class="artifact">
                  <v-icon size="small">mdi-lightbulb-outline</v-icon>
                  <span>{{ session.ideas?.length || 0 }} Ideas</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="expanded-actions">
                <v-btn
                  color="primary"
                  variant="flat"
                  @click.stop="openSession(session.documentId)"
                >
                  Open Session
                </v-btn>
                <v-btn
                  v-if="session.work_status === 'draft'"
                  color="success"
                  variant="outlined"
                  @click.stop="processSession(session)"
                >
                  <v-icon left>mdi-play</v-icon>
                  Process
                </v-btn>
                <v-btn
                  color="error"
                  variant="text"
                  @click.stop="confirmDelete(session)"
                >
                  Delete
                </v-btn>
              </div>
            </div>
          </transition>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.pageCount > 1" class="pagination-container">
          <v-pagination
            :model-value="pagination.page"
            :length="pagination.pageCount"
            :total-visible="5"
            rounded="circle"
            @update:model-value="onPageChange"
          />
          <span class="pagination-info">
            {{ pagination.total }} sessions total
          </span>
        </div>
      </div>
    </main>

    <!-- Create Session Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="500">
      <v-card>
        <v-card-title>Create New Session</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newSession.title"
            label="Session Title"
            variant="outlined"
            :rules="[v => !!v || 'Title is required']"
          />
          <v-date-input
            v-model="newSession.date_start"
            label="Start Date"
            variant="outlined"
            prepend-icon=""
            prepend-inner-icon="mdi-calendar"
            clearable
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showCreateDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="createSession" :loading="creating">
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>Delete Session</v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ sessionToDelete?.title }}"?
          This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="deleteSession" :loading="deleting">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, reactive } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { Session } from '../api/sessions.service';
import SessionsFilterSidebar from './components/SessionsFilterSidebar.vue';

export default defineComponent({
  name: 'SessionsList',

  components: {
    SessionsFilterSidebar,
  },

  setup() {
    const store = useStore();
    const router = useRouter();

    // State
    const sidebarCollapsed = ref(false);
    const expandedSessions = ref<Set<string>>(new Set());
    const showCreateDialog = ref(false);
    const showDeleteDialog = ref(false);
    const sessionToDelete = ref<Session | null>(null);
    const creating = ref(false);
    const deleting = ref(false);

    // Filters
    const searchQuery = ref('');
    const dateRange = ref<Date[]>([]);
    const statusFilter = ref('');
    const participantFilter = ref('');

    // Sorting
    const sortOrder = ref<'asc' | 'desc'>('desc');

    // New session form
    const newSession = reactive({
      title: '',
      date_start: null as Date | null,
    });

    // Snackbar
    const snackbar = reactive({
      show: false,
      message: '',
      color: 'success',
    });

    // Computed
    const sessions = computed(() => store.getters['sessions/sessions']);
    const loading = computed(() => store.getters['sessions/isLoading']);
    const contacts = computed(() => store.getters['contacts/allItems']);
    const pagination = computed(() => store.getters['sessions/pagination']);

    // Methods
    const showMessage = (message: string, color = 'success') => {
      snackbar.message = message;
      snackbar.color = color;
      snackbar.show = true;
    };

    const formatDate = (dateStr: string | undefined) => {
      if (!dateStr) return '-';
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'ready':
          return 'success';
        case 'processing':
          return 'warning';
        case 'error':
          return 'error';
        default:
          return 'grey';
      }
    };

    const toggleSession = (documentId: string) => {
      if (expandedSessions.value.has(documentId)) {
        expandedSessions.value.delete(documentId);
      } else {
        expandedSessions.value.add(documentId);
      }
      expandedSessions.value = new Set(expandedSessions.value);
    };

    const openSession = (documentId: string) => {
      router.push({ name: 'SessionDetail', params: { id: documentId } });
    };

    // Unified debounce for all filters
    let filterTimeout: number | null = null;
    const DEBOUNCE_DELAY = 500;

    const applyFilters = async () => {
      let dateStart: string | undefined;
      let dateEnd: string | undefined;

      if (dateRange.value.length >= 2) {
        // Sort dates to ensure start is before end
        const sortedDates = [...dateRange.value].sort((a, b) => a.getTime() - b.getTime());
        dateStart = sortedDates[0].toISOString().split('T')[0];
        dateEnd = sortedDates[sortedDates.length - 1].toISOString().split('T')[0];
      }

      const filtersPayload = {
        search: searchQuery.value || undefined,
        dateStart,
        dateEnd,
        status: statusFilter.value || undefined,
        participantId: participantFilter.value || undefined,
        sortBy: 'createdAt' as const,
        sortOrder: sortOrder.value,
      };
      console.log('[SessionsList] applyFilters:', filtersPayload);
      await store.dispatch('sessions/setFilters', filtersPayload);
    };

    const debouncedApplyFilters = () => {
      if (filterTimeout) clearTimeout(filterTimeout);
      filterTimeout = window.setTimeout(() => {
        applyFilters();
      }, DEBOUNCE_DELAY);
    };

    // Universal handler for all filter changes
    const onFilterChange = (filterType: string, value: any) => {
      console.log(`[SessionsList] Filter changed: ${filterType} =`, value);
      
      switch (filterType) {
        case 'search':
          searchQuery.value = value;
          break;
        case 'dateRange':
          dateRange.value = value;
          break;
        case 'status':
          statusFilter.value = value;
          break;
        case 'participant':
          participantFilter.value = value;
          break;
      }
      
      debouncedApplyFilters();
    };

    // Toggle date sorting
    const toggleDateSort = () => {
      sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc';
      applyFilters();
    };

    // Pagination handler
    const onPageChange = (page: number) => {
      store.dispatch('sessions/setPage', page);
    };

    const clearFilters = async () => {
      // Clear timeout to prevent pending filter applications
      if (filterTimeout) clearTimeout(filterTimeout);
      
      searchQuery.value = '';
      dateRange.value = [];
      statusFilter.value = '';
      participantFilter.value = '';
      sortOrder.value = 'desc';
      await store.dispatch('sessions/setFilters', { sortBy: 'createdAt', sortOrder: 'desc' });
    };

    const createSession = async () => {
      if (!newSession.title) {
        showMessage('Please enter a title', 'error');
        return;
      }

      creating.value = true;
      try {
        const session = await store.dispatch('sessions/createSession', {
          title: newSession.title,
          date_start: newSession.date_start ? newSession.date_start.toISOString() : undefined,
        });
        showCreateDialog.value = false;
        newSession.title = '';
        newSession.date_start = null;
        showMessage('Session created successfully');
        
        // Navigate to the new session
        router.push({ name: 'SessionDetail', params: { id: session.documentId } });
      } catch (error: any) {
        showMessage(error.message || 'Failed to create session', 'error');
      } finally {
        creating.value = false;
      }
    };

    const confirmDelete = (session: Session) => {
      sessionToDelete.value = session;
      showDeleteDialog.value = true;
    };

    const deleteSession = async () => {
      if (!sessionToDelete.value) return;

      deleting.value = true;
      try {
        await store.dispatch('sessions/deleteSession', sessionToDelete.value.documentId);
        showDeleteDialog.value = false;
        sessionToDelete.value = null;
        showMessage('Session deleted');
      } catch (error: any) {
        showMessage(error.message || 'Failed to delete session', 'error');
      } finally {
        deleting.value = false;
      }
    };

    const processSession = async (session: Session) => {
      try {
        await store.dispatch('sessions/processSession', session.documentId);
        showMessage('Processing started');
        // Navigate to session detail to see progress
        router.push({ name: 'SessionDetail', params: { id: session.documentId } });
      } catch (error: any) {
        showMessage(error.message || 'Failed to start processing', 'error');
      }
    };

    // Lifecycle
    onMounted(() => {
      store.dispatch('sessions/fetchSessions');
      store.dispatch('contacts/fetchContacts');
    });

    return {
      // State
      sidebarCollapsed,
      expandedSessions,
      showCreateDialog,
      showDeleteDialog,
      sessionToDelete,
      creating,
      deleting,
      searchQuery,
      dateRange,
      statusFilter,
      participantFilter,
      sortOrder,
      newSession,
      snackbar,

      // Computed
      sessions,
      loading,
      contacts,
      pagination,

      // Methods
      formatDate,
      getStatusColor,
      toggleSession,
      openSession,
      clearFilters,
      onFilterChange,
      toggleDateSort,
      onPageChange,
      createSession,
      confirmDelete,
      deleteSession,
      processSession,
    };
  },
});
</script>

<style scoped>
.sessions-page {
  display: flex;
  min-height: calc(100vh - 64px);
  background: #f5f5f5;
}

/* Main Content */
.sessions-content {
  flex: 1;
  padding: 24px;
  overflow-x: auto;
}

.sessions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.sessions-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
}

/* Table */
.sessions-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 120px 1fr 100px 80px 100px 50px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.session-row {
  display: grid;
  grid-template-columns: 120px 1fr 100px 80px 100px 50px;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
  align-items: center;
}

.session-row:hover {
  background: #f8f9fa;
}

.session-row.expanded {
  background: #f0f4ff;
  border-bottom: none;
}

.col-title {
  font-weight: 500;
}

.col-expand {
  text-align: center;
}

/* Sortable Header */
.sortable-header {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background 0.2s;
  user-select: none;
}

.sortable-header:hover {
  background: rgba(0, 0, 0, 0.06);
}

.sort-icon {
  opacity: 0.7;
  transition: transform 0.2s, opacity 0.2s;
}

.sortable-header:hover .sort-icon {
  opacity: 1;
}

/* Expanded Card */
.session-expanded {
  background: #f8f9fa;
  padding: 16px 24px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.expanded-section {
  margin-bottom: 16px;
}

.expanded-section h4 {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.summary-text {
  color: #333;
  line-height: 1.6;
}

.narratives-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.narrative-item {
  background: white;
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.narrative-title {
  font-size: 14px;
}

.narrative-percent {
  font-weight: 600;
  color: #1976d2;
}

.sources-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.source-chip {
  background: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 13px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.more-sources {
  color: #666;
  font-size: 13px;
}

.artifacts {
  display: flex;
  gap: 16px;
}

.artifact {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 14px;
}

.expanded-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

/* Pagination */
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

.pagination-info {
  color: #666;
  font-size: 13px;
}

/* Empty State */
.empty-state {
  padding: 64px 24px;
  text-align: center;
  color: #666;
}

.empty-state p {
  margin: 16px 0 24px;
  font-size: 16px;
}

/* Transitions */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 500px;
}

/* Responsive */
@media (max-width: 1024px) {
  .table-header,
  .session-row {
    grid-template-columns: 100px 1fr 80px 60px 90px 40px;
    font-size: 13px;
  }
}
</style>

