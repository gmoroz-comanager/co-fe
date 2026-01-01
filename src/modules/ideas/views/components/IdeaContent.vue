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

    <!-- Visual Description with Image Generation -->
    <VisualDescriptionCard
      v-if="idea.visualDescription"
      :visual-description="idea.visualDescription"
      :post-media="idea.postMedia"
      :generating="generatingImage"
      :uploading="uploadingImage"
      @generate-image="$emit('generate-image')"
      @upload-image="$emit('upload-image', $event)"
      @remove-image="$emit('remove-image')"
    />

    <!-- Announcement Text -->
    <section v-if="idea.announcementText" class="content-section">
      <h3>LinkedIn Announcement</h3>
      <div class="highlight-card blue">
        <v-icon color="blue" class="mr-2">mdi-linkedin</v-icon>
        <span>{{ idea.announcementText }}</span>
      </div>
    </section>

    <!-- Polished Content (Editable) -->
    <section v-if="idea.polishedBody || showPolishedEditor" class="content-section polished-section">
      <div class="section-header">
        <h3>Polished Content</h3>
        <v-chip v-if="idea.polishedBody" color="success" size="small" variant="tonal">
          <v-icon start size="small">mdi-check</v-icon>
          Ready to publish
        </v-chip>
      </div>
      <EditableText
        :model-value="idea.polishedBody || ''"
        display-tag="div"
        display-class="polished-text"
        label="Polished Content"
        placeholder="Enter polished content for publishing..."
        :multiline="true"
        :rows="6"
        :saving="polishedSaving"
        @save="onPolishedSave"
      >
        <template #display>
          <div class="polished-card">
            <p class="content-text pre-wrap">{{ idea.polishedBody }}</p>
          </div>
        </template>
      </EditableText>
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

  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import { Idea } from '../../api/ideas.service';
import VisualDescriptionCard from './VisualDescriptionCard.vue';
import EditableText from './EditableText.vue';

export default defineComponent({
  name: 'IdeaContent',

  components: {
    VisualDescriptionCard,
    EditableText,
  },

  props: {
    idea: {
      type: Object as PropType<Idea>,
      required: true,
    },
    generatingImage: {
      type: Boolean,
      default: false,
    },
    uploadingImage: {
      type: Boolean,
      default: false,
    },
    polishedSaving: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['generate-image', 'upload-image', 'remove-image', 'update:polished-body'],

  setup(props, { emit }) {
    const parseTags = (tagsString: string): string[] => {
      if (!tagsString) return [];
      return tagsString.split(',').map((tag: string) => tag.trim());
    };

    const showPolishedEditor = computed(() => {
      // Show editor even if no polished content yet, so user can add it
      return !props.idea.polishedBody && props.idea.draftText;
    });

    const onPolishedSave = (newContent: string) => {
      emit('update:polished-body', newContent);
    };

    return {
      parseTags,
      showPolishedEditor,
      onPolishedSave,
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.content-section h3 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.section-header h3 {
  margin-bottom: 0;
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
  flex: 1;
}

.polished-section :deep(.view-mode) {
  width: 100%;
}

.polished-section :deep(.polished-card) {
  width: 100%;
}
</style>
