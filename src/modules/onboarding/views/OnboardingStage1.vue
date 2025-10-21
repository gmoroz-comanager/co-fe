<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-card class="pa-6" elevation="3">
          <v-card-title class="text-h4 mb-4">
            Welcome! Let's Set Up Your Profile
          </v-card-title>
          
          <v-card-subtitle class="text-body-1 mb-6">
            Upload your LinkedIn profile PDF to help us understand your professional background and create personalized content recommendations.
          </v-card-subtitle>

          <!-- Success State -->
          <v-alert
            v-if="uploadSuccess"
            type="success"
            prominent
            class="mb-4"
          >
            <v-row align="center">
              <v-col class="grow">
                Profile analyzed successfully! Redirecting...
              </v-col>
            </v-row>
          </v-alert>

          <!-- Error State -->
          <v-alert
            v-if="errorMessage"
            type="error"
            dismissible
            class="mb-4"
            @click:close="errorMessage = ''"
          >
            {{ errorMessage }}
          </v-alert>

          <!-- Upload Area -->
          <v-card
            v-if="!uploadSuccess"
            :class="['drop-zone pa-8 mb-4', { 'drop-zone--active': isDragging }]"
            outlined
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
          >
            <div class="text-center">
              <v-icon size="64" color="primary" class="mb-4">
                mdi-cloud-upload
              </v-icon>
              
              <div v-if="!selectedFile" class="text-h6 mb-2">
                Drag and drop your LinkedIn PDF here
              </div>
              
              <div v-if="!selectedFile" class="text-body-2 text-grey">
                or click to select a file
              </div>

              <div v-if="selectedFile" class="text-h6 mb-2">
                {{ selectedFile.name }}
              </div>
              
              <div v-if="selectedFile" class="text-body-2 text-grey">
                {{ formatFileSize(selectedFile.size) }}
              </div>

              <input
                ref="fileInput"
                type="file"
                accept="application/pdf"
                style="display: none"
                @change="handleFileSelect"
              />
            </div>
          </v-card>

          <!-- Upload Progress -->
          <v-progress-linear
            v-if="isUploading"
            indeterminate
            color="primary"
            class="mb-4"
          />

          <!-- Action Buttons -->
          <v-row v-if="!uploadSuccess">
            <v-col cols="12" sm="6">
              <v-btn
                block
                size="large"
                variant="outlined"
                :disabled="isUploading"
                @click="handleSkip"
              >
                Skip for Now
              </v-btn>
            </v-col>
            <v-col cols="12" sm="6">
              <v-btn
                block
                size="large"
                color="primary"
                :disabled="!selectedFile || isUploading"
                :loading="isUploading"
                @click="handleUpload"
              >
                Analyze Profile
              </v-btn>
            </v-col>
          </v-row>

          <!-- Info Section -->
          <v-divider class="my-6" />
          
          <div class="text-body-2 text-grey">
            <v-icon size="small" class="mr-2">mdi-information</v-icon>
            Your profile data is securely processed and used only to personalize your experience.
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { onboardingService } from '../api';

export default defineComponent({
  name: 'OnboardingStage1',
  setup() {
    const router = useRouter();
    const store = useStore();

    const selectedFile = ref<File | null>(null);
    const isDragging = ref(false);
    const isUploading = ref(false);
    const uploadSuccess = ref(false);
    const errorMessage = ref('');
    const fileInput = ref<HTMLInputElement | null>(null);

    const triggerFileInput = () => {
      fileInput.value?.click();
    };

    const handleFileSelect = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        if (file.type === 'application/pdf') {
          selectedFile.value = file;
          errorMessage.value = '';
        } else {
          errorMessage.value = 'Please select a PDF file';
        }
      }
    };

    const handleDrop = (event: DragEvent) => {
      isDragging.value = false;
      
      if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
        const file = event.dataTransfer.files[0];
        if (file.type === 'application/pdf') {
          selectedFile.value = file;
          errorMessage.value = '';
        } else {
          errorMessage.value = 'Please select a PDF file';
        }
      }
    };

    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleUpload = async () => {
      if (!selectedFile.value) return;

      isUploading.value = true;
      errorMessage.value = '';

      try {
        const response = await onboardingService.uploadLinkedInPdf(selectedFile.value);
        
        if (response.success) {
          uploadSuccess.value = true;
          
          // Update user data in store
          await store.dispatch('auth/refreshUser');
          
          // Redirect after a short delay
          setTimeout(() => {
            router.push({ name: 'Home' });
          }, 2000);
        } else {
          errorMessage.value = 'Upload failed. Please try again.';
        }
      } catch (error: any) {
        console.error('Upload error:', error);
        errorMessage.value = error.response?.data?.error || 'Failed to upload and analyze PDF. Please try again.';
      } finally {
        isUploading.value = false;
      }
    };

    const handleSkip = async () => {
      isUploading.value = true;
      errorMessage.value = '';

      try {
        await onboardingService.skipStage1();
        
        // Update user data in store
        await store.dispatch('auth/refreshUser');
        
        // Redirect to home
        router.push({ name: 'Home' });
      } catch (error: any) {
        console.error('Skip error:', error);
        errorMessage.value = 'Failed to skip onboarding. Please try again.';
        isUploading.value = false;
      }
    };

    return {
      selectedFile,
      isDragging,
      isUploading,
      uploadSuccess,
      errorMessage,
      fileInput,
      triggerFileInput,
      handleFileSelect,
      handleDrop,
      formatFileSize,
      handleUpload,
      handleSkip,
    };
  },
});
</script>

<style scoped>
.drop-zone {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px dashed rgba(0, 0, 0, 0.2);
  background-color: rgba(0, 0, 0, 0.02);
}

.drop-zone:hover {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.drop-zone--active {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.1);
  transform: scale(1.02);
}
</style>

