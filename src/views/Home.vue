<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 mb-6">Welcome to CoFlow</h1>
      </v-col>
    </v-row>

    <!-- Ideas Dashboard Widget -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card class="ideas-dashboard" rounded="lg">
          <v-card-title class="text-h5">
            Ideas Dashboard
          </v-card-title>
          
          <v-card-text>
            <v-row v-if="loading" class="my-3">
              <v-col cols="12" class="text-center">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </v-col>
            </v-row>
            
            <div v-else>
              <!-- Stats Cards -->
              <v-row>
                <v-col cols="6">
                  <v-card rounded="lg" variant="tonal">
                    <v-card-title class="d-flex align-center">
                      <v-badge dot color="amber" class="mr-2"></v-badge>
                      Total Ideas
                    </v-card-title>
                    <v-card-text class="text-h4 text-center">
                      {{ totalIdeas }}
                    </v-card-text>
                  </v-card>
                </v-col>
                
                <v-col cols="6">
                  <v-card rounded="lg" variant="tonal">
                    <v-card-title class="d-flex align-center">
                      <v-badge dot color="red" class="mr-2"></v-badge>
                      New Ideas
                    </v-card-title>
                    <v-card-text class="text-h4 text-center">
                      {{ newIdeas }}
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              
              <!-- Recent Ideas List -->
              <v-card class="mt-4" rounded="lg">
                <v-card-title>Recent Ideas</v-card-title>
                <v-list v-if="recentIdeas.length > 0">
                  <v-list-item
                    v-for="idea in recentIdeas"
                    :key="idea.id"
                    :to="{ name: 'IdeaDetail', params: { id: idea.id } }"
                  >
                    <template v-slot:prepend>
                      <v-badge
                        dot
                        :color="getStatusColor(idea.work_status)"
                      ></v-badge>
                    </template>
                    
                    <v-list-item-title>
                      {{ idea.title }}
                    </v-list-item-title>
                    
                    <v-list-item-subtitle>
                      {{ formatDate(idea.createdAt) }}
                    </v-list-item-subtitle>
                    
                    <template v-slot:append>
                      <v-btn
                        icon="mdi-chevron-right"
                        variant="text"
                        :to="{ name: 'IdeaDetail', params: { id: idea.id } }"
                      ></v-btn>
                    </template>
                  </v-list-item>
                </v-list>
                
                <v-card-text v-else class="text-center py-4">
                  No ideas found
                </v-card-text>
                
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="primary"
                    variant="text"
                    :to="{ name: 'IdeasList' }"
                  >
                    View All Ideas
                  </v-btn>
                </v-card-actions>
              </v-card>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <!-- Additional content can go here -->
      <v-col cols="12" md="6">
        <v-card height="100%" rounded="lg">
          <v-card-title class="text-h5">
            Quick Actions
          </v-card-title>
          
          <v-card-text>
            <v-row>
              <v-col cols="6">
                <v-btn
                  block
                  color="primary"
                  variant="elevated"
                  to="/audio"
                  prepend-icon="mdi-waveform"
                  class="mb-4"
                >
                  Audio Manager
                </v-btn>
              </v-col>
              
              <v-col cols="6">
                <v-btn
                  block
                  color="secondary"
                  variant="elevated"
                  to="/ideas"
                  prepend-icon="mdi-lightbulb"
                  class="mb-4"
                >
                  Ideas Catalog
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'Home',
  
  setup() {
    const store = useStore();
    
    // Computed properties
    const loading = computed(() => store.getters['ideas/isLoading']);
    const totalIdeas = computed(() => store.getters['ideas/totalIdeas']);
    const newIdeas = computed(() => store.getters['ideas/newIdeas']);
    const recentIdeas = computed(() => store.getters['ideas/recentIdeas']);
    
    // Methods
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    };
    
    const getStatusColor = (status: string | undefined) => {
      switch (status) {
        case 'new': return 'red';
        case 'readyToPublish': return 'orange';
        case 'published': return 'green';
        default: return 'grey';
      }
    };
    
    // Fetch ideas when component is mounted
    onMounted(() => {
      store.dispatch('ideas/fetchIdeas');
    });
    
    return {
      loading,
      totalIdeas,
      newIdeas,
      recentIdeas,
      formatDate,
      getStatusColor
    };
  }
});
</script>

<style scoped>
.ideas-dashboard {
  height: 100%;
}
</style>