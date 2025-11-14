<template>
  <v-container>
    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-col>
    </v-row>
    
    <div v-else-if="error">
      <v-alert type="error">{{ error }}</v-alert>
    </div>
    
    <div v-else-if="idea">
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title class="text-h4">
              {{ idea.title }}
            </v-card-title>
            
            <v-card-subtitle>
              <v-chip
                :color="getStatusColor(idea.work_status)"
                class="mr-2"
                size="small"
              >
                {{ idea.work_status }}
              </v-chip>
              <span class="text-caption">
                Created: {{ formatDate(idea.createdAt) }}
              </span>
            </v-card-subtitle>
            
            <v-card-text>
              <!-- Alternative Titles -->
              <div v-if="idea.alternativeTitles && idea.alternativeTitles.length > 0" class="mb-4">
                <div class="text-h6 mb-2">Alternative Titles:</div>
                <v-chip
                  v-for="(title, index) in idea.alternativeTitles"
                  :key="index"
                  class="mr-2 mb-2"
                  variant="outlined"
                  color="primary"
                >
                  {{ title }}
                </v-chip>
              </div>

              <!-- Brand Facet & Channel -->
              <v-row v-if="idea.brandFacet || idea.recommendedChannel" class="mb-4">
                <v-col v-if="idea.brandFacet" cols="12" md="6">
                  <div class="text-subtitle-2 text-grey">Brand Facet:</div>
                  <div class="text-body-1">{{ idea.brandFacet }}</div>
                </v-col>
                <v-col v-if="idea.recommendedChannel" cols="12" md="6">
                  <div class="text-subtitle-2 text-grey">Recommended Channel:</div>
                  <div class="text-body-1">{{ idea.recommendedChannel }}</div>
                </v-col>
              </v-row>
              
              <!-- Hook/Question -->
              <div v-if="idea.question" class="mb-4">
                <div class="text-h6">Hook:</div>
                <div class="text-body-1">{{ idea.question }}</div>
              </div>
              
              <!-- Short Description -->
              <div v-if="idea.body" class="mb-4">
                <div class="text-h6">Description:</div>
                <div class="text-body-1">{{ idea.body }}</div>
              </div>
              
              <!-- Draft Text (Full Content) -->
              <div v-if="idea.draftText" class="mb-4">
                <div class="text-h6">Draft Text:</div>
                <v-card variant="outlined" class="pa-4">
                  <div class="text-body-1" style="white-space: pre-wrap;">{{ idea.draftText }}</div>
                </v-card>
              </div>

              <!-- Visual Description -->
              <div v-if="idea.visualDescription" class="mb-4">
                <div class="text-h6">Visual Description:</div>
                <v-card variant="outlined" class="pa-3">
                  <v-icon class="mr-2" color="purple">mdi-image-outline</v-icon>
                  <span class="text-body-2">{{ idea.visualDescription }}</span>
                </v-card>
              </div>

              <!-- Announcement Text -->
              <div v-if="idea.announcementText" class="mb-4">
                <div class="text-h6">LinkedIn Announcement:</div>
                <v-card variant="outlined" class="pa-3">
                  <v-icon class="mr-2" color="blue">mdi-linkedin</v-icon>
                  <span class="text-body-2">{{ idea.announcementText }}</span>
                </v-card>
              </div>
              
              <!-- Polished Content -->
              <div v-if="idea.polishedBody" class="mb-4">
                <div class="text-h6">Polished Content:</div>
                <v-card variant="tonal" color="success" class="pa-4">
                  <div class="text-body-1" style="white-space: pre-wrap;">{{ idea.polishedBody }}</div>
                </v-card>
              </div>
              
              <!-- Tags -->
              <div v-if="idea.tags" class="mb-4">
                <div class="text-h6">Tags:</div>
                <div>
                  <v-chip
                    v-for="(tag, index) in parseTags(idea.tags)"
                    :key="index"
                    class="mr-2 mb-2"
                    size="small"
                  >
                    {{ tag }}
                  </v-chip>
                </div>
              </div>
              
              <!-- Related Content Strategy -->
              <div v-if="idea.content_strategy" class="mb-4">
                <div class="text-h6">Content Strategy:</div>
                <v-chip color="purple" variant="outlined">
                  {{ idea.content_strategy.name || 'Strategy' }}
                </v-chip>
              </div>

              <!-- Related Audio -->
              <div v-if="idea.audio_source" class="mb-4">
                <div class="text-h6">Related Audio:</div>
                <v-btn
                  color="primary"
                  variant="outlined"
                  :to="'/audio'"
                  prepend-icon="mdi-headphones"
                >
                  View Audio Source
                </v-btn>
              </div>
            </v-card-text>
            
            <v-divider></v-divider>

            <v-card-actions class="pa-4">
              <v-btn
                color="grey"
                variant="outlined"
                @click="$router.push('/ideas')"
                prepend-icon="mdi-arrow-left"
              >
                Back to List
              </v-btn>
              
              <v-spacer></v-spacer>

              <!-- Feedback Buttons -->
              <v-btn
                color="success"
                variant="outlined"
                @click="handleLike"
                :loading="likeLoading"
                :disabled="dislikeLoading || polishLoading"
                prepend-icon="mdi-thumb-up"
              >
                Like
              </v-btn>
              
              <v-btn
                color="error"
                variant="outlined"
                @click="handleDislike"
                :loading="dislikeLoading"
                :disabled="likeLoading || polishLoading"
                prepend-icon="mdi-thumb-down"
                class="ml-2"
              >
                Dislike
              </v-btn>

              <!-- Polish Button -->
              <v-btn
                color="purple"
                variant="elevated"
                @click="openPolishDialog"
                :loading="polishLoading"
                :disabled="likeLoading || dislikeLoading"
                prepend-icon="mdi-auto-fix"
                class="ml-4"
              >
                Polish
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- Snackbar for feedback -->
      <v-snackbar
        v-model="snackbar"
        :color="snackbarColor"
        :timeout="3000"
      >
        {{ snackbarMessage }}
      </v-snackbar>

      <!-- Polish Feedback Dialog -->
      <v-dialog v-model="polishDialog" max-width="600">
        <v-card>
          <v-card-title>Add Feedback for Polishing</v-card-title>
          <v-card-text>
            <p class="mb-4">What would you like to improve or change?</p>
            <v-textarea
              v-model="polishFeedback"
              label="Your feedback"
              rows="4"
              variant="outlined"
              auto-grow
            ></v-textarea>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="closePolishDialog">Cancel</v-btn>
            <v-btn
              color="purple"
              variant="elevated"
              @click="submitPolishRequest"
              :loading="polishLoading"
            >
              Submit
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    
    <div v-else>
      <v-alert type="warning">Idea not found</v-alert>
    </div>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ideasService } from '../api/ideas.service';

export default {
  name: 'IdeaDetail',
  
  setup() {
    const route = useRoute();
    const idea = ref(null);
    const loading = ref(true);
    const error = ref(null);
    
    // Feedback state
    const likeLoading = ref(false);
    const dislikeLoading = ref(false);
    const polishLoading = ref(false);
    
    // Snackbar state
    const snackbar = ref(false);
    const snackbarMessage = ref('');
    const snackbarColor = ref('success');
    
    // Polish dialog state
    const polishDialog = ref(false);
    const polishFeedback = ref('');
    
    const fetchIdea = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        const response = await ideasService.getIdea(route.params.id);
        // Strapi v5 returns data directly without attributes wrapper
        idea.value = response.data;
      } catch (err) {
        console.error('Error fetching idea:', err);
        error.value = err.message || 'Failed to fetch idea details';
      } finally {
        loading.value = false;
      }
    };
    
    const handleLike = async () => {
      likeLoading.value = true;
      try {
        await ideasService.likeIdea(route.params.id);
        snackbarMessage.value = 'You liked this idea!';
        snackbarColor.value = 'success';
        snackbar.value = true;
      } catch (err) {
        console.error('Error liking idea:', err);
        snackbarMessage.value = 'Failed to record like';
        snackbarColor.value = 'error';
        snackbar.value = true;
      } finally {
        likeLoading.value = false;
      }
    };
    
    const handleDislike = async () => {
      dislikeLoading.value = true;
      try {
        await ideasService.dislikeIdea(route.params.id);
        snackbarMessage.value = 'You disliked this idea.';
        snackbarColor.value = 'warning';
        snackbar.value = true;
      } catch (err) {
        console.error('Error disliking idea:', err);
        snackbarMessage.value = 'Failed to record dislike';
        snackbarColor.value = 'error';
        snackbar.value = true;
      } finally {
        dislikeLoading.value = false;
      }
    };
    
    const openPolishDialog = () => {
      polishFeedback.value = '';
      polishDialog.value = true;
    };
    
    const closePolishDialog = () => {
      polishDialog.value = false;
    };
    
    const submitPolishRequest = async () => {
      polishLoading.value = true;
      try {
        const response = await ideasService.polishIdea(route.params.id, polishFeedback.value);
        
        if (response.data) {
          idea.value = response.data;
          
          snackbarMessage.value = 'Idea polished successfully!';
          snackbarColor.value = 'success';
          snackbar.value = true;
          
          closePolishDialog();
        }
      } catch (err) {
        console.error('Error polishing idea:', err);
        snackbarMessage.value = err.response?.data?.error?.message || 'Failed to polish idea';
        snackbarColor.value = 'error';
        snackbar.value = true;
      } finally {
        polishLoading.value = false;
      }
    };
    
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };
    
    const getStatusColor = (status) => {
      switch (status) {
        case 'new': return 'red';
        case 'readyToPublish': return 'orange';
        case 'published': return 'green';
        default: return 'grey';
      }
    };
    
    const parseTags = (tagsString) => {
      if (!tagsString) return [];
      return tagsString.split(',').map(tag => tag.trim());
    };
    
    onMounted(() => {
      fetchIdea();
    });
    
    return {
      idea,
      loading,
      error,
      likeLoading,
      dislikeLoading,
      polishLoading,
      snackbar,
      snackbarMessage,
      snackbarColor,
      polishDialog,
      polishFeedback,
      handleLike,
      handleDislike,
      openPolishDialog,
      closePolishDialog,
      submitPolishRequest,
      formatDate,
      getStatusColor,
      parseTags
    };
  }
};
</script>
