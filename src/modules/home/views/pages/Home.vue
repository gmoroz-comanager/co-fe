<template>
  <div class="dashboard">
    <!-- Hero Section -->
    <header class="dashboard-hero">
      <div class="hero-content">
        <h1 class="hero-title">Welcome to <span class="gradient-text">CoFlow</span></h1>
        <p class="hero-subtitle">Your content creation command center</p>
      </div>
    </header>

    <div class="dashboard-content">
      <!-- Stats Row -->
      <section class="stats-section">
        <h2 class="section-title">
          <v-icon class="section-icon">mdi-lightbulb-on</v-icon>
          Ideas Overview
        </h2>
        
        <div class="stats-grid">
          <!-- Total Ideas -->
          <div class="stat-card stat-total" @click="navigateToIdeas()">
            <div class="stat-icon-wrapper">
              <v-icon size="28">mdi-lightbulb-group</v-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ statusCounts.total }}</span>
              <span class="stat-label">Total Ideas</span>
            </div>
          </div>

          <!-- New Ideas -->
          <div class="stat-card stat-new" @click="navigateToIdeas('new')">
            <div class="stat-icon-wrapper">
              <v-icon size="28">mdi-star-shooting</v-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ statusCounts.new }}</span>
              <span class="stat-label">New</span>
            </div>
          </div>

          <!-- Planned -->
          <div class="stat-card stat-planned" @click="navigateToIdeas('planned')">
            <div class="stat-icon-wrapper">
              <v-icon size="28">mdi-calendar-clock</v-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ statusCounts.planned }}</span>
              <span class="stat-label">Planned</span>
            </div>
          </div>

          <!-- Ready to Publish -->
          <div class="stat-card stat-ready" @click="navigateToIdeas('readyToPublish')">
            <div class="stat-icon-wrapper">
              <v-icon size="28">mdi-rocket-launch</v-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ statusCounts.readyToPublish }}</span>
              <span class="stat-label">Ready to Publish</span>
            </div>
          </div>

          <!-- Published -->
          <div class="stat-card stat-published" @click="navigateToIdeas('published')">
            <div class="stat-icon-wrapper">
              <v-icon size="28">mdi-check-decagram</v-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ statusCounts.published }}</span>
              <span class="stat-label">Published</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Grid -->
      <div class="main-grid">
        <!-- Recent Ideas -->
        <section class="recent-ideas-section">
          <div class="section-header">
            <h2 class="section-title">
              <v-icon class="section-icon">mdi-clock-outline</v-icon>
              Recent Ideas
            </h2>
            <router-link :to="{ name: 'IdeasList' }" class="view-all-link">
              View All
              <v-icon size="16">mdi-arrow-right</v-icon>
            </router-link>
          </div>

          <div v-if="loading" class="loading-state">
            <v-progress-circular indeterminate color="primary" size="40"></v-progress-circular>
          </div>

          <div v-else-if="recentIdeas.length === 0" class="empty-state">
            <v-icon size="48" color="grey-lighten-1">mdi-lightbulb-off-outline</v-icon>
            <p>No ideas yet. Start by creating your first content session!</p>
            <v-btn
              color="primary"
              variant="flat"
              :to="{ name: 'SessionsList' }"
              prepend-icon="mdi-plus"
            >
              New Session
            </v-btn>
          </div>

          <div v-else class="ideas-list">
            <router-link
              v-for="idea in recentIdeas"
              :key="idea.id"
              :to="{ name: 'IdeaDetail', params: { id: idea.documentId || idea.id } }"
              class="idea-card"
            >
              <div class="idea-status">
                <span :class="['status-dot', `status-${idea.work_status || 'new'}`]"></span>
              </div>
              <div class="idea-content">
                <h3 class="idea-title">{{ idea.title }}</h3>
                <p class="idea-date">{{ formatDate(idea.createdAt) }}</p>
              </div>
              <div class="idea-arrow">
                <v-icon size="20">mdi-chevron-right</v-icon>
              </div>
            </router-link>
          </div>
        </section>

        <!-- Quick Actions -->
        <section class="quick-actions-section">
          <h2 class="section-title">
            <v-icon class="section-icon">mdi-lightning-bolt</v-icon>
            Quick Actions
          </h2>

          <div class="actions-grid">
            <router-link :to="{ name: 'SessionsList' }" class="action-card action-sessions">
              <div class="action-icon">
                <v-icon size="32">mdi-microphone-outline</v-icon>
              </div>
              <div class="action-info">
                <h3>Sessions</h3>
                <p>Record & transcribe content</p>
              </div>
            </router-link>

            <router-link :to="{ name: 'IdeasList' }" class="action-card action-ideas">
              <div class="action-icon">
                <v-icon size="32">mdi-lightbulb-outline</v-icon>
              </div>
              <div class="action-info">
                <h3>Ideas</h3>
                <p>Browse & refine ideas</p>
              </div>
            </router-link>

            <router-link :to="{ name: 'PostingCalendar' }" class="action-card action-calendar">
              <div class="action-icon">
                <v-icon size="32">mdi-calendar-month-outline</v-icon>
              </div>
              <div class="action-info">
                <h3>Calendar</h3>
                <p>Schedule your posts</p>
              </div>
            </router-link>

            <router-link :to="{ name: 'StrategiesList' }" class="action-card action-strategy">
              <div class="action-icon">
                <v-icon size="32">mdi-target</v-icon>
              </div>
              <div class="action-info">
                <h3>Strategy</h3>
                <p>Define content pillars</p>
              </div>
            </router-link>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { formatDate } from '@/core/helpers/dateFormat';

export default defineComponent({
  name: 'Home',
  
  setup() {
    const store = useStore();
    const router = useRouter();
    
    // Computed properties
    const loading = computed(() => store.getters['ideas/isLoading']);
    const recentIdeas = computed(() => store.getters['ideas/recentIdeas']);
    const statusCounts = computed(() => store.getters['ideas/statusCounts']);
    
    // Navigation helper
    const navigateToIdeas = (status?: string) => {
      if (status) {
        router.push({ name: 'IdeasList', query: { status } });
      } else {
        router.push({ name: 'IdeasList' });
      }
    };
    
    const getStatusColor = (status: string | undefined) => {
      switch (status) {
        case 'new': return '#ef4444';
        case 'planned': return '#f59e0b';
        case 'readyToPublish': return '#8b5cf6';
        case 'published': return '#10b981';
        default: return '#6b7280';
      }
    };
    
    // Fetch data when component is mounted
    onMounted(async () => {
      await Promise.all([
        store.dispatch('ideas/fetchIdeas'),
        store.dispatch('ideas/fetchStatusCounts')
      ]);
    });
    
    return {
      loading,
      recentIdeas,
      statusCounts,
      formatDate,
      getStatusColor,
      navigateToIdeas
    };
  }
});
</script>

<style scoped>
/* Base Variables */
.dashboard {
  --color-primary: #5c6bc0;
  --color-primary-dark: #3f51b5;
  --color-new: #ef4444;
  --color-planned: #f59e0b;
  --color-ready: #8b5cf6;
  --color-published: #10b981;
  --color-total: #3b82f6;
  --color-text: #1e293b;
  --color-text-secondary: #64748b;
  --color-border: #e2e8f0;
  --color-bg-card: #ffffff;
  
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f7ff 0%, #f8fafc 100%);
}

/* Hero Section */
.dashboard-hero {
  position: relative;
  padding: 48px 32px 32px;
  background: linear-gradient(135deg, #5c6bc0 0%, #7986cb 100%);
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
}

.hero-title {
  font-family: 'Inter', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px;
  letter-spacing: -0.02em;
}

.gradient-text {
  background: linear-gradient(135deg, #fff, #e8eaff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

/* Dashboard Content */
.dashboard-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 32px 48px;
}

/* Section Titles */
.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 20px;
}

.section-icon {
  color: var(--color-text-secondary);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.view-all-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s;
}

.view-all-link:hover {
  color: var(--color-primary-dark);
}

/* Stats Section */
.stats-section {
  margin-bottom: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: transparent;
}

.stat-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  flex-shrink: 0;
}

.stat-total .stat-icon-wrapper {
  background: linear-gradient(135deg, #dbeafe, #eff6ff);
  color: var(--color-total);
}

.stat-total:hover {
  border-color: var(--color-total);
}

.stat-new .stat-icon-wrapper {
  background: linear-gradient(135deg, #fee2e2, #fef2f2);
  color: var(--color-new);
}

.stat-new:hover {
  border-color: var(--color-new);
}

.stat-planned .stat-icon-wrapper {
  background: linear-gradient(135deg, #fef3c7, #fffbeb);
  color: var(--color-planned);
}

.stat-planned:hover {
  border-color: var(--color-planned);
}

.stat-ready .stat-icon-wrapper {
  background: linear-gradient(135deg, #ede9fe, #f5f3ff);
  color: var(--color-ready);
}

.stat-ready:hover {
  border-color: var(--color-ready);
}

.stat-published .stat-icon-wrapper {
  background: linear-gradient(135deg, #d1fae5, #ecfdf5);
  color: var(--color-published);
}

.stat-published:hover {
  border-color: var(--color-published);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

/* Main Grid */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

/* Recent Ideas Section */
.recent-ideas-section {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-state p {
  color: var(--color-text-secondary);
  margin: 16px 0 24px;
  max-width: 280px;
}

.ideas-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.idea-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid transparent;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.idea-card:hover {
  background: #f1f5f9;
  border-color: var(--color-border);
}

.idea-status {
  flex-shrink: 0;
}

.status-dot {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-dot.status-new { background: var(--color-new); }
.status-dot.status-planned { background: var(--color-planned); }
.status-dot.status-readyToPublish { background: var(--color-ready); }
.status-dot.status-published { background: var(--color-published); }

.idea-content {
  flex: 1;
  min-width: 0;
}

.idea-title {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-text);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.idea-date {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  margin: 4px 0 0;
}

.idea-arrow {
  color: var(--color-text-secondary);
  transition: color 0.2s;
}

.idea-card:hover .idea-arrow {
  color: var(--color-primary);
}

/* Quick Actions Section */
.quick-actions-section {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 14px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.action-card:hover {
  transform: translateY(-2px);
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  flex-shrink: 0;
}

.action-info h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.action-info p {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  margin: 4px 0 0;
}

/* Action Card Variants */
.action-sessions {
  background: linear-gradient(135deg, #fef2f2, #fff);
  border: 1px solid #fecaca;
}

.action-sessions:hover {
  background: linear-gradient(135deg, #fee2e2, #fef2f2);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
}

.action-sessions .action-icon {
  background: #fee2e2;
  color: #ef4444;
}

.action-ideas {
  background: linear-gradient(135deg, #fffbeb, #fff);
  border: 1px solid #fde68a;
}

.action-ideas:hover {
  background: linear-gradient(135deg, #fef3c7, #fffbeb);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
}

.action-ideas .action-icon {
  background: #fef3c7;
  color: #f59e0b;
}

.action-calendar {
  background: linear-gradient(135deg, #f5f3ff, #fff);
  border: 1px solid #ddd6fe;
}

.action-calendar:hover {
  background: linear-gradient(135deg, #ede9fe, #f5f3ff);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
}

.action-calendar .action-icon {
  background: #ede9fe;
  color: #8b5cf6;
}

.action-strategy {
  background: linear-gradient(135deg, #ecfdf5, #fff);
  border: 1px solid #a7f3d0;
}

.action-strategy:hover {
  background: linear-gradient(135deg, #d1fae5, #ecfdf5);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.action-strategy .action-icon {
  background: #d1fae5;
  color: #10b981;
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .dashboard-content {
    padding: 24px 16px 32px;
  }
  
  .dashboard-hero {
    padding: 32px 16px 24px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  
  .stat-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
  }
  
  .stat-icon-wrapper {
    width: 48px;
    height: 48px;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    flex-direction: row;
  }
}
</style>
