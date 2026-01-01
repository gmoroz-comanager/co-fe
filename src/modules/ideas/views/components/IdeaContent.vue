<template>
  <div class="idea-content">
    <!-- Alternative Titles -->
    <section v-if="idea.alternativeTitles && idea.alternativeTitles.length > 0" class="content-section">
      <h3>Alternative Titles</h3>
      <div class="chips-row">
        <v-chip
          v-for="(title, index) in idea.alternativeTitles"
          :key="index"
          variant="outlined"
          color="primary"
        >
          {{ title }}
        </v-chip>
      </div>
    </section>

    <!-- Brand Facet & Channel -->
    <section v-if="idea.brandFacet || idea.recommendedChannel" class="content-section meta-grid">
      <div v-if="idea.brandFacet" class="meta-item">
        <div class="meta-label">Brand Facet</div>
        <div class="meta-value">{{ idea.brandFacet }}</div>
      </div>
      <div v-if="idea.recommendedChannel" class="meta-item">
        <div class="meta-label">Recommended Channel</div>
        <div class="meta-value">{{ idea.recommendedChannel }}</div>
      </div>
    </section>

    <!-- Hook/Question -->
    <section v-if="idea.question" class="content-section">
      <h3>Hook</h3>
      <p class="content-text">{{ idea.question }}</p>
    </section>

    <!-- Short Description -->
    <section v-if="idea.body" class="content-section">
      <h3>Description</h3>
      <p class="content-text">{{ idea.body }}</p>
    </section>

    <!-- Draft Text (Full Content) -->
    <section v-if="idea.draftText" class="content-section">
      <h3>Draft Text</h3>
      <div class="text-card">
        <p class="content-text pre-wrap">{{ idea.draftText }}</p>
      </div>
    </section>

    <!-- Visual Description -->
    <section v-if="idea.visualDescription" class="content-section">
      <h3>Visual Description</h3>
      <div class="highlight-card purple">
        <v-icon color="purple" class="mr-2">mdi-image-outline</v-icon>
        <span>{{ idea.visualDescription }}</span>
      </div>
    </section>

    <!-- Announcement Text -->
    <section v-if="idea.announcementText" class="content-section">
      <h3>LinkedIn Announcement</h3>
      <div class="highlight-card blue">
        <v-icon color="blue" class="mr-2">mdi-linkedin</v-icon>
        <span>{{ idea.announcementText }}</span>
      </div>
    </section>

    <!-- Polished Content -->
    <section v-if="idea.polishedBody" class="content-section">
      <h3>Polished Content</h3>
      <div class="polished-card">
        <p class="content-text pre-wrap">{{ idea.polishedBody }}</p>
      </div>
    </section>

    <!-- Tags -->
    <section v-if="idea.tags" class="content-section">
      <h3>Tags</h3>
      <div class="chips-row">
        <v-chip
          v-for="(tag, index) in parseTags(idea.tags)"
          :key="index"
          size="small"
        >
          {{ tag }}
        </v-chip>
      </div>
    </section>

    <!-- Related Content Strategy -->
    <section v-if="idea.content_strategy" class="content-section">
      <h3>Content Strategy</h3>
      <v-chip color="purple" variant="outlined">
        {{ idea.content_strategy.name || 'Strategy' }}
      </v-chip>
    </section>

    <!-- Related Audio -->
    <section v-if="idea.audio_source" class="content-section">
      <h3>Related Audio</h3>
      <v-btn
        color="primary"
        variant="outlined"
        :to="'/audio'"
        prepend-icon="mdi-headphones"
      >
        View Audio Source
      </v-btn>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Idea } from '../../api/ideas.service';

export default defineComponent({
  name: 'IdeaContent',

  props: {
    idea: {
      type: Object as PropType<Idea>,
      required: true,
    },
  },

  setup() {
    const parseTags = (tagsString: string): string[] => {
      if (!tagsString) return [];
      return tagsString.split(',').map((tag: string) => tag.trim());
    };

    return {
      parseTags,
    };
  },
});
</script>

<style scoped>
.idea-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.content-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.content-section h3 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.content-text {
  line-height: 1.6;
  color: #333;
  margin: 0;
}

.pre-wrap {
  white-space: pre-wrap;
}

.chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #666;
}

.meta-value {
  font-size: 15px;
  color: #333;
}

.text-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e0e0e0;
}

.highlight-card {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border-radius: 8px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
}

.highlight-card.purple {
  background: #f3e5f5;
  border-color: #ce93d8;
}

.highlight-card.blue {
  background: #e3f2fd;
  border-color: #90caf9;
}

.polished-card {
  background: #e8f5e9;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #a5d6a7;
}
</style>

