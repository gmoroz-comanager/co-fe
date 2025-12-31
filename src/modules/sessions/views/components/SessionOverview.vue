<template>
  <section class="content-section overview-section">
    <h2>Overview</h2>
    
    <div v-if="session.summary" class="overview-summary">
      <h4>Summary</h4>
      <p>{{ session.summary }}</p>
    </div>

    <div v-if="session.participants?.length" class="overview-participants">
      <h4>Participants</h4>
      <div class="participants-list">
        <v-chip
          v-for="participant in session.participants"
          :key="participant.documentId"
          size="small"
          class="mr-2 mb-2"
        >
          {{ participant.name }}
        </v-chip>
        <v-btn size="small" variant="text" prepend-icon="mdi-plus">
          Add
        </v-btn>
      </div>
    </div>

    <div v-if="session.narratives?.length" class="overview-narratives">
      <h4>Key Narratives</h4>
      <div class="narratives-grid">
        <div
          v-for="(narrative, idx) in session.narratives"
          :key="idx"
          class="narrative-card"
        >
          <div class="narrative-header">
            <span class="narrative-title">{{ narrative.title }}</span>
            <span class="narrative-percent">{{ narrative.percent }}%</span>
          </div>
          <p v-if="narrative.description" class="narrative-desc">
            {{ narrative.description }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="!session.summary && !session.narratives?.length" class="overview-empty">
      <p>No summary yet. Process the session to generate insights.</p>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Session } from '../../api/sessions.service';

export default defineComponent({
  name: 'SessionOverview',

  props: {
    session: {
      type: Object as PropType<Session>,
      required: true,
    },
  },
});
</script>

<style scoped>
.content-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.content-section h2 {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
}

.overview-section h4 {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 16px 0 8px;
}

.overview-section h4:first-child {
  margin-top: 0;
}

.overview-summary p {
  color: #333;
  line-height: 1.6;
}

.participants-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.narratives-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.narrative-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px 16px;
}

.narrative-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.narrative-title {
  font-weight: 500;
}

.narrative-percent {
  font-weight: 700;
  color: #1976d2;
}

.narrative-desc {
  font-size: 13px;
  color: #666;
  margin: 0;
}

.overview-empty {
  color: #666;
  text-align: center;
  padding: 24px;
}

@media (max-width: 768px) {
  .narratives-grid {
    grid-template-columns: 1fr;
  }
}
</style>

