<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-card class="pa-8 text-center" elevation="3">
          
          <!-- Upload State (Initial) -->
          <div v-if="!isProcessing && !uploadSuccess && !errorMessage">
            <v-icon size="80" color="primary" class="mb-4">
              mdi-file-upload
            </v-icon>
            
            <v-card-title class="text-h4 mb-4 justify-center">
              Upload LinkedIn Profile
            </v-card-title>
            
            <v-card-subtitle class="text-body-1 mb-6">
              Upload your LinkedIn profile PDF to generate your brand persona.
            </v-card-subtitle>

            <v-file-input
              v-model="selectedFile"
              accept=".pdf"
              label="Select PDF file"
              variant="outlined"
              prepend-icon="mdi-file-pdf-box"
              show-size
              truncate-length="15"
              class="mb-4"
              :error-messages="fileError"
            ></v-file-input>

            <v-btn
              block
              size="large"
              color="primary"
              @click="uploadFile"
              :disabled="!selectedFile"
              class="mb-4"
            >
              Upload & Analyze
            </v-btn>

            <div class="d-flex justify-center align-center mb-4">
               <v-divider></v-divider>
               <span class="mx-4 text-grey">OR</span>
               <v-divider></v-divider>
            </div>

            <v-btn
              block
              size="large"
              variant="text"
              color="grey"
              @click="skipOnboarding"
            >
              Skip Onboarding
            </v-btn>
            
             <v-btn
              block
              size="large"
              variant="text"
              color="error"
              class="mt-2"
              @click="handleLogout"
            >
              Logout
            </v-btn>

          </div>

          <!-- Processing State -->
          <div v-if="isProcessing && !uploadSuccess && !errorMessage">
            <v-icon size="80" color="primary" class="mb-4">
              mdi-account-check
            </v-icon>
            
            <v-card-title class="text-h4 mb-4 justify-center">
              Processing Your Profile
            </v-card-title>
            
            <v-card-subtitle class="text-body-1 mb-6">
              Please wait. We're analyzing your LinkedIn profile with AI...
            </v-card-subtitle>

            <v-progress-circular
              :size="70"
              :width="7"
              color="primary"
              indeterminate
              class="mb-4"
            />
            
            <div class="text-body-2 text-grey mt-4">
              This may take up to a minute
            </div>
          </div>

          <!-- Success State -->
          <div v-if="uploadSuccess">
            <v-icon size="80" color="success" class="mb-4">
              mdi-check-circle
            </v-icon>
            
            <v-card-title class="text-h4 mb-4 justify-center">
              Success!
            </v-card-title>
            
            <v-card-subtitle class="text-body-1 mb-4">
              Your profile has been successfully analyzed. Redirecting...
            </v-card-subtitle>
          </div>

          <!-- Error State -->
          <div v-if="errorMessage && !isProcessing">
            <v-icon size="80" color="error" class="mb-4">
              mdi-alert-circle
            </v-icon>
            
            <v-card-title class="text-h5 mb-4 justify-center">
              Analysis Failed
            </v-card-title>
            
            <v-alert
              type="error"
              variant="tonal"
              class="mb-6 text-left"
            >
              {{ errorMessage }}
            </v-alert>

            <v-row>
              <v-col cols="12" sm="6">
                <v-btn
                  block
                  size="large"
                  variant="outlined"
                  @click="handleLogout"
                >
                  Logout
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6">
                <v-btn
                  block
                  size="large"
                  color="primary"
                  @click="resetState"
                >
                  Try Again
                </v-btn>
              </v-col>
               <v-col cols="12" class="mt-2">
                <v-btn
                  block
                  size="large"
                  variant="text"
                  color="grey"
                  @click="skipOnboarding"
                >
                  Skip Onboarding
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { onboardingService } from '../api';

export default defineComponent({
  name: 'OnboardingStage1',
  setup() {
    const router = useRouter();
    const store = useStore();

    const isProcessing = ref(false);
    const uploadSuccess = ref(false);
    const errorMessage = ref('');
    const selectedFile = ref<File | null>(null);
    const fileError = ref('');

    // Check if we should try legacy processing (admin uploaded) on mount?
    // Actually, let's not auto-start. Let the user choose.
    
    const uploadFile = async () => {
      if (!selectedFile.value) {
        fileError.value = 'Please select a file';
        return;
      }
      if (Array.isArray(selectedFile.value)) {
         selectedFile.value = selectedFile.value[0];
      }

      isProcessing.value = true;
      errorMessage.value = '';
      fileError.value = '';

      try {
        const response = await onboardingService.uploadLinkedInPdf(selectedFile.value as File);
        
        if (response.success) {
          uploadSuccess.value = true;
          await store.dispatch('auth/refreshUser');
          setTimeout(() => {
            router.push({ name: 'Home' });
          }, 2000);
        } else {
            errorMessage.value = response.message || 'Analysis failed.';
        }
      } catch (error: any) {
        console.error('Upload error:', error);
        errorMessage.value = error.response?.data?.error || 'Failed to upload and analyze PDF.';
      } finally {
        isProcessing.value = false;
      }
    };
    
    const resetState = () => {
        errorMessage.value = '';
        selectedFile.value = null;
    };

    const processProfileLegacy = async () => {
      // Legacy auto-check for admin uploaded files
      isProcessing.value = true;
      try {
        const response = await onboardingService.processProfile();
        if (response.success) {
             uploadSuccess.value = true;
             await store.dispatch('auth/refreshUser');
             setTimeout(() => { router.push({ name: 'Home' }); }, 2000);
        }
      } catch (e) {
          // If legacy fails, we just show the upload form, no error displayed yet.
          // Unless explicitly triggered.
      } finally {
          isProcessing.value = false;
      }
    };

    const skipOnboarding = async () => {
      isProcessing.value = true;
      try {
        await onboardingService.skipStage1();
        await store.dispatch('auth/refreshUser');
        router.push({ name: 'Home' });
      } catch (error) {
        console.error('Skip error:', error);
        errorMessage.value = 'Failed to skip onboarding.';
        isProcessing.value = false;
      }
    };

    const handleLogout = () => {
      store.dispatch('auth/logout');
      router.push({ name: 'Login' });
    };

    onMounted(() => {
        // Optional: Check if admin already uploaded something? 
        // For now, let's default to showing the form.
        // processProfileLegacy(); 
    });

    return {
      isProcessing,
      uploadSuccess,
      errorMessage,
      selectedFile,
      fileError,
      uploadFile,
      resetState,
      handleLogout,
      skipOnboarding,
    };
  },
});
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
