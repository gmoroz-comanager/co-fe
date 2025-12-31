<template>
  <div class="sessions-page">
    <!-- Sidebar Filters -->
    <aside class="filters-sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <h3 v-if="!sidebarCollapsed">Filters</h3>
        <v-btn
          icon
          variant="text"
          size="small"
          @click="sidebarCollapsed = !sidebarCollapsed"
        >
          <v-icon>{{ sidebarCollapsed ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
        </v-btn>
      </div>

      <div v-if="!sidebarCollapsed" class="filters-content">
        <!-- Search -->
        <div class="filter-group">
          <v-text-field
            v-model="searchQuery"
            label="Search sessions..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            @update:model-value="debouncedSearch"
          />
        </div>

        <!-- Date Range -->
        <div class="filter-group">
          <label class="filter-label">Date Range</label>
          <v-text-field
            v-model="dateStart"
            type="date"
            label="From"
            variant="outlined"
            density="compact"
            hide-details
            class="mb-2"
          />
          <v-text-field
            v-model="dateEnd"
            type="date"
            label="To"
            variant="outlined"
            density="compact"
            hide-details
          />
        </div>

        <!-- Status Filter -->
        <div class="filter-group">
          <label class="filter-label">Status</label>
          <v-select
            v-model="statusFilter"
            :items="statusOptions"
            variant="outlined"
            density="compact"
            hide-details
            clearable
          />
        </div>

        <!-- Apply Filters Button -->
        <v-btn
          color="primary"
          block
          class="mt-4"
          @click="applyFilters"
        >
          Apply Filters
        </v-btn>

        <v-btn
          variant="text"
          block
          class="mt-2"
          @click="clearFilters"
        >
          Clear All
        </v-btn>
      </div>
    </aside>

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
          <div class="col-date">Date</div>
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
          <v-text-field
            v-model="newSession.date_start"
            label="Start Date"
            type="datetime-local"
            variant="outlined"
          />
          <v-text-field
            v-model="newSession.date_end"
            label="End Date"
            type="datetime-local"
            variant="outlined"
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

export default defineComponent({
  name: 'SessionsList',

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
    const dateStart = ref('');
    const dateEnd = ref('');
    const statusFilter = ref('');

    const statusOptions = [
      { title: 'All', value: '' },
      { title: 'Draft', value: 'draft' },
      { title: 'Processing', value: 'processing' },
      { title: 'Ready', value: 'ready' },
      { title: 'Error', value: 'error' },
    ];

    // New session form
    const newSession = reactive({
      title: '',
      date_start: '',
      date_end: '',
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

    const applyFilters = async () => {
      await store.dispatch('sessions/setFilters', {
        search: searchQuery.value || undefined,
        dateStart: dateStart.value || undefined,
        dateEnd: dateEnd.value || undefined,
        status: statusFilter.value || undefined,
      });
    };

    const clearFilters = async () => {
      searchQuery.value = '';
      dateStart.value = '';
      dateEnd.value = '';
      statusFilter.value = '';
      await store.dispatch('sessions/setFilters', {});
    };

    let searchTimeout: number | null = null;
    const debouncedSearch = () => {
      if (searchTimeout) clearTimeout(searchTimeout);
      searchTimeout = window.setTimeout(() => {
        applyFilters();
      }, 300);
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
          date_start: newSession.date_start || undefined,
          date_end: newSession.date_end || undefined,
        });
        showCreateDialog.value = false;
        newSession.title = '';
        newSession.date_start = '';
        newSession.date_end = '';
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
      dateStart,
      dateEnd,
      statusFilter,
      statusOptions,
      newSession,
      snackbar,

      // Computed
      sessions,
      loading,

      // Methods
      formatDate,
      getStatusColor,
      toggleSession,
      openSession,
      applyFilters,
      clearFilters,
      debouncedSearch,
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

/* Sidebar */
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

  .table-header,
  .session-row {
    grid-template-columns: 100px 1fr 80px 60px 90px 40px;
    font-size: 13px;
  }
}
</style>

