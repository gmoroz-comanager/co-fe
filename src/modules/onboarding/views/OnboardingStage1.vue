<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-card class="pa-8 text-center" elevation="3">
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
              Profile Not Ready
            </v-card-title>
            
            <v-alert
              type="error"
              variant="tonal"
              class="mb-6 text-left"
            >
              {{ errorMessage }}
            </v-alert>

            <v-card-subtitle class="text-body-2 mb-6">
              Administrator needs to upload your LinkedIn PDF to the system. Please contact the exhibition organizers.
            </v-card-subtitle>

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
                  @click="retryProcessing"
                >
                  Try Again
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

    const processProfile = async () => {
      isProcessing.value = true;
      uploadSuccess.value = false;
      errorMessage.value = '';

      try {
        const response = await onboardingService.processProfile();
        
        if (response.success) {
          uploadSuccess.value = true;
          
          // Update user data in store
          await store.dispatch('auth/refreshUser');
          
          // Redirect after a short delay
          setTimeout(() => {
            router.push({ name: 'Home' });
          }, 2000);
        } else {
          errorMessage.value = 'Failed to process profile. Please try again later.';
        }
      } catch (error: any) {
        console.error('Processing error:', error);
        errorMessage.value = error.response?.data?.error || 'PDF file has not been uploaded by administrator yet.';
      } finally {
        isProcessing.value = false;
      }
    };

    const retryProcessing = () => {
      processProfile();
    };

    const handleLogout = () => {
      store.dispatch('auth/logout');
      router.push({ name: 'Login' });
    };

    // Auto-start processing on mount
    onMounted(() => {
      processProfile();
    });

    return {
      isProcessing,
      uploadSuccess,
      errorMessage,
      retryProcessing,
      handleLogout,
    };
  },
});
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
