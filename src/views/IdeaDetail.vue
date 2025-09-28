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
              {{ idea.attributes.title }}
            </v-card-title>
            
            <v-card-subtitle>
              <v-chip
                :color="getStatusColor(idea.attributes.work_status)"
                class="mr-2"
                size="small"
              >
                {{ idea.attributes.work_status }}
              </v-chip>
              <span class="text-caption">
                Created: {{ formatDate(idea.attributes.createdAt) }}
              </span>
            </v-card-subtitle>
            
            <v-card-text>
              <div v-if="idea.attributes.question" class="mb-4">
                <div class="text-h6">Question:</div>
                <div>{{ idea.attributes.question }}</div>
              </div>
              
              <div v-if="idea.attributes.body" class="mb-4">
                <div class="text-h6">Content:</div>
                <div v-html="renderBlocks(idea.attributes.body)"></div>
              </div>
              
              <div v-if="idea.attributes.polishedBody" class="mb-4">
                <div class="text-h6">Polished Content:</div>
                <div v-html="renderBlocks(idea.attributes.polishedBody)"></div>
              </div>
              
              <div v-if="idea.attributes.tags" class="mb-4">
                <div class="text-h6">Tags:</div>
                <div>
                  <v-chip
                    v-for="(tag, index) in parseTags(idea.attributes.tags)"
                    :key="index"
                    class="mr-2 mb-2"
                    size="small"
                  >
                    {{ tag }}
                  </v-chip>
                </div>
              </div>
              
              <div v-if="idea.attributes.audio_source && idea.attributes.audio_source.data" class="mb-4">
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
            
            <v-card-actions>
              <v-btn color="primary" @click="$router.push('/')">
                Back to Home
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>
    
    <div v-else>
      <v-alert type="warning">Idea not found</v-alert>
    </div>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

export default {
  name: 'IdeaDetail',
  
  setup() {
    const route = useRoute();
    const idea = ref(null);
    const loading = ref(true);
    const error = ref(null);
    
    const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:1337/api';
    
    const fetchIdea = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/ideas/${route.params.id}?populate=*`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        idea.value = response.data.data;
      } catch (err) {
        console.error('Error fetching idea:', err);
        error.value = err.message || 'Failed to fetch idea details';
      } finally {
        loading.value = false;
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
    
    const renderBlocks = (blocks) => {
      if (!blocks) return '';
      
      // Simple rendering of blocks content - in a real app you'd use a proper blocks renderer
      let html = '';
      blocks.forEach(block => {
        if (block.type === 'paragraph') {
          html += `<p>${block.children.map(child => child.text).join('')}</p>`;
        } else if (block.type === 'heading') {
          const level = block.level || 3;
          html += `<h${level}>${block.children.map(child => child.text).join('')}</h${level}>`;
        }
      });
      
      return html;
    };
    
    onMounted(() => {
      fetchIdea();
    });
    
    return {
      idea,
      loading,
      error,
      formatDate,
      getStatusColor,
      parseTags,
      renderBlocks
    };
  }
};
</script>
