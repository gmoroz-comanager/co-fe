<template>
  <section class="visual-description-card">
    <div class="header-row">
      <h3>Visual Description</h3>
      <v-btn
        v-if="!postMedia"
        color="deep-purple"
        variant="elevated"
        size="small"
        prepend-icon="mdi-auto-fix"
        :loading="generating"
        @click="$emit('generate-image')"
      >
        Generate Image
      </v-btn>
    </div>

    <!-- Visual Description Text -->
    <div class="description-content">
      <v-icon color="deep-purple" class="description-icon">mdi-image-outline</v-icon>
      <span class="description-text">{{ visualDescription }}</span>
    </div>

    <!-- Generated Image Preview -->
    <div v-if="postMedia" class="generated-image-container">
      <div class="image-wrapper">
        <img 
          :src="getMediaUrl(postMedia.url)" 
          :alt="postMedia.name || 'Generated image'"
          class="generated-image"
        />
        <div class="image-overlay">
          <v-btn
            icon
            size="small"
            color="white"
            variant="flat"
            @click="openFullscreen"
          >
            <v-icon>mdi-fullscreen</v-icon>
          </v-btn>
          <v-btn
            icon
            size="small"
            color="deep-purple"
            variant="flat"
            :loading="generating"
            @click="$emit('generate-image')"
          >
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </div>
      </div>
      <div class="image-info">
        <v-icon size="small" color="success" class="mr-1">mdi-check-circle</v-icon>
        <span class="text-caption text-grey-darken-1">Image generated</span>
      </div>
    </div>

    <!-- Fullscreen Dialog -->
    <v-dialog v-model="fullscreenDialog" max-width="1200">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Generated Image</span>
          <v-btn icon variant="text" @click="fullscreenDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <img 
            v-if="postMedia"
            :src="getMediaUrl(postMedia.url)" 
            :alt="postMedia.name || 'Generated image'"
            class="fullscreen-image"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

interface PostMedia {
  id: number;
  name: string;
  url: string;
  mime: string;
  size: number;
}

export default defineComponent({
  name: 'VisualDescriptionCard',

  props: {
    visualDescription: {
      type: String,
      required: true,
    },
    postMedia: {
      type: Object as PropType<PostMedia | null>,
      default: null,
    },
    generating: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['generate-image'],

  setup() {
    const fullscreenDialog = ref(false);

    const getMediaUrl = (url: string): string => {
      // If URL is already absolute, return as is
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      // Otherwise prepend API base URL
      const baseUrl = process.env.VUE_APP_BE_URL || 'http://localhost:1337';
      return `${baseUrl}${url}`;
    };

    const openFullscreen = () => {
      fullscreenDialog.value = true;
    };

    return {
      fullscreenDialog,
      getMediaUrl,
      openFullscreen,
    };
  },
});
</script>

<style scoped>
.visual-description-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-row h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.description-content {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border-radius: 8px;
  background: #f3e5f5;
  border: 1px solid #ce93d8;
}

.description-icon {
  margin-right: 12px;
  flex-shrink: 0;
}

.description-text {
  color: #333;
  line-height: 1.5;
}

.generated-image-container {
  margin-top: 16px;
}

.image-wrapper {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
}

.generated-image {
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.image-wrapper:hover .image-overlay {
  opacity: 1;
}

.image-info {
  display: flex;
  align-items: center;
  margin-top: 8px;
  padding: 8px 12px;
  background: #e8f5e9;
  border-radius: 6px;
}

.fullscreen-image {
  width: 100%;
  max-height: 80vh;
  object-fit: contain;
}
</style>

