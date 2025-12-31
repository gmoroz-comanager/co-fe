<template>
  <div class="swimlane-container">
    <div
      v-for="group in groupedIdeas"
      :key="group.sessionId || 'uncategorized'"
      class="swimlane"
      :class="{ 'swimlane--collapsed': isCollapsed(group.sessionId) }"
    >
      <!-- Swimlane Header -->
      <div 
        class="swimlane-header"
        :class="{ 'swimlane-header--clickable': true }"
        @click="toggleCollapse(group.sessionId)"
      >
        <div class="swimlane-title-row">
          <v-btn
            variant="text"
            density="compact"
            size="small"
            icon
            class="collapse-btn mr-1"
            @click.stop="toggleCollapse(group.sessionId)"
          >
            <v-icon size="small">
              {{ isCollapsed(group.sessionId) ? 'mdi-chevron-right' : 'mdi-chevron-down' }}
            </v-icon>
          </v-btn>
          <v-icon
            :color="group.sessionId ? 'primary' : 'grey'"
            size="small"
            class="mr-2"
          >
            {{ group.sessionId ? 'mdi-folder-outline' : 'mdi-folder-question-outline' }}
          </v-icon>
          <h3 class="swimlane-title">{{ group.sessionTitle }}</h3>
          <v-chip size="x-small" variant="tonal" class="ml-2">
            {{ group.ideas.length }}
          </v-chip>
          <router-link
            v-if="group.sessionId"
            :to="{ name: 'SessionDetail', params: { id: group.sessionId } }"
            class="ml-auto session-link"
            @click.stop
          >
            <v-btn variant="text" size="x-small" color="primary">
              View Session
              <v-icon size="x-small" end>mdi-open-in-new</v-icon>
            </v-btn>
          </router-link>
        </div>
      </div>

      <!-- Ideas Grid within Swimlane -->
      <v-expand-transition>
        <div v-show="!isCollapsed(group.sessionId)" class="swimlane-ideas-grid">
          <slot 
            v-for="idea in group.ideas"
            :key="idea.id"
            name="idea-card"
            :idea="idea"
          >
            <!-- Fallback content if no slot provided -->
            <div class="idea-card-fallback">{{ idea.title }}</div>
          </slot>
        </div>
      </v-expand-transition>
    </div>

    <!-- Empty swimlane state -->
    <div v-if="groupedIdeas.length === 0" class="empty-swimlane">
      <v-icon size="64" color="grey-lighten-1">mdi-folder-outline</v-icon>
      <p>No sessions with ideas found.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import type { SessionGroup } from '../../store/ideas.store';

export default defineComponent({
  name: 'IdeasSwimlaneView',

  props: {
    groupedIdeas: {
      type: Array as PropType<SessionGroup[]>,
      required: true,
    },
  },

  setup() {
    // Track collapsed swimlanes by session ID
    const collapsedSwimlanes = ref<Set<string | null>>(new Set());

    const isCollapsed = (sessionId: string | null): boolean => {
      return collapsedSwimlanes.value.has(sessionId);
    };

    const toggleCollapse = (sessionId: string | null): void => {
      if (collapsedSwimlanes.value.has(sessionId)) {
        collapsedSwimlanes.value.delete(sessionId);
      } else {
        collapsedSwimlanes.value.add(sessionId);
      }
      // Trigger reactivity
      collapsedSwimlanes.value = new Set(collapsedSwimlanes.value);
    };

    return {
      isCollapsed,
      toggleCollapse,
    };
  },
});
</script>

<style scoped>
.swimlane-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.swimlane {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: padding 0.2s ease;
}

.swimlane--collapsed {
  padding-bottom: 12px;
}

.swimlane-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.swimlane-header--clickable {
  cursor: pointer;
  border-radius: 8px;
  margin: -8px;
  padding: 8px;
  padding-bottom: 20px;
  margin-bottom: 8px;
  transition: background-color 0.15s ease;
}

.swimlane-header--clickable:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.swimlane--collapsed .swimlane-header {
  margin-bottom: 0;
  padding-bottom: 8px;
  border-bottom: none;
}

.collapse-btn {
  opacity: 0.6;
  transition: opacity 0.15s ease;
}

.swimlane-header:hover .collapse-btn {
  opacity: 1;
}

.swimlane-title-row {
  display: flex;
  align-items: center;
}

.swimlane-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.session-link {
  text-decoration: none;
}

.swimlane-ideas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.idea-card-fallback {
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.empty-swimlane {
  padding: 64px 24px;
  text-align: center;
  color: #666;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-swimlane p {
  margin: 16px 0 0;
  font-size: 16px;
}

/* Responsive */
@media (max-width: 1024px) {
  .swimlane-ideas-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }
}

@media (max-width: 768px) {
  .swimlane-ideas-grid {
    grid-template-columns: 1fr;
  }
  
  .swimlane {
    padding: 16px;
  }
}
</style>
