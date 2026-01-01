<template>
  <section class="visual-description-card">
    <div class="header-row">
      <h3>Visual Description</h3>
      <div class="header-actions">
        <v-btn
          color="primary"
          variant="outlined"
          size="small"
          prepend-icon="mdi-upload"
          :loading="uploading"
          @click="triggerFileInput"
        >
          Upload Image
        </v-btn>
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
    </div>

    <!-- Hidden File Input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileSelect"
    />

    <!-- Visual Description Text -->
    <div class="description-content">
      <v-icon color="deep-purple" class="description-icon">mdi-image-outline</v-icon>
      <span class="description-text">{{ visualDescription }}</span>
    </div>

    <!-- Generated/Uploaded Image Preview -->
    <div v-if="postMedia" class="generated-image-container">
      <div class="image-wrapper">
        <img 
          :src="getMediaUrl(postMedia.url)" 
          :alt="postMedia.name || 'Post image'"
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
            color="primary"
            variant="flat"
            :loading="uploading"
            @click="triggerFileInput"
          >
            <v-icon>mdi-upload</v-icon>
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
          <v-btn
            icon
            size="small"
            color="error"
            variant="flat"
            :disabled="generating || uploading"
            @click="confirmRemoveImage"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </div>
      </div>
      <div class="image-info">
        <v-icon size="small" color="success" class="mr-1">mdi-check-circle</v-icon>
        <span class="text-caption text-grey-darken-1">Image attached</span>
      </div>
    </div>

    <!-- Fullscreen Dialog -->
    <v-dialog v-model="fullscreenDialog" max-width="1200">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Post Image</span>
          <v-btn icon variant="text" @click="fullscreenDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <img 
            v-if="postMedia"
            :src="getMediaUrl(postMedia.url)" 
            :alt="postMedia.name || 'Post image'"
            class="fullscreen-image"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Remove Confirmation Dialog -->
    <ConfirmationDialog
      v-model="showRemoveDialog"
      title="Remove Image?"
      message="Are you sure you want to remove this image? This action cannot be undone."
      confirm-text="Remove"
      cancel-text="Cancel"
      confirm-color="error"
      icon="mdi-delete-alert"
      icon-color="error"
      @confirm="handleRemoveImage"
      @cancel="showRemoveDialog = false"
    />
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { ConfirmationDialog } from '@/core/components';

interface PostMedia {
  id: number;
  name: string;
  url: string;
  mime: string;
  size: number;
}

export default defineComponent({
  name: 'VisualDescriptionCard',

  components: {
    ConfirmationDialog,
  },

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
    uploading: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['generate-image', 'upload-image', 'remove-image'],

  setup(_, { emit }) {
    const fullscreenDialog = ref(false);
    const showRemoveDialog = ref(false);
    const fileInput = ref<HTMLInputElement | null>(null);

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

    const triggerFileInput = () => {
      fileInput.value?.click();
    };

    const handleFileSelect = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert('Please select an image file');
          return;
        }
        
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert('Image size must be less than 10MB');
          return;
        }
        
        emit('upload-image', file);
      }
      
      // Reset input so same file can be selected again
      target.value = '';
    };

    const confirmRemoveImage = () => {
      showRemoveDialog.value = true;
    };

    const handleRemoveImage = () => {
      showRemoveDialog.value = false;
      emit('remove-image');
    };

    return {
      fullscreenDialog,
      showRemoveDialog,
      fileInput,
      getMediaUrl,
      openFullscreen,
      triggerFileInput,
      handleFileSelect,
      confirmRemoveImage,
      handleRemoveImage,
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
  flex-wrap: wrap;
  gap: 12px;
}

.header-row h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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
