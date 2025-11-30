<template>
  <div class="container mx-auto p-6 max-w-7xl">
    <h1 class="text-3xl font-bold mb-8">Audio Management</h1>
    
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <!-- Audio Creation Form -->
      <div class="lg:col-span-4">
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-800">Add New Audio File</h2>
          </div>
          <div class="p-4">
            <form @submit.prevent="handleSubmit">
              <div class="mb-4">
                <v-text-field
                  label="Title"
                  v-model="audioForm.title"
                  placeholder="Enter title"
                  :disabled="isSubmitting"
                  required
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </div>
              
              <div class="mb-4">
                <label
                  for="audio-file-input"
                  class="file-drop-zone rounded-lg"
                  :class="{ 'is-dragging': isDragging }"
                  @dragenter.prevent="isDragging = true"
                  @dragover.prevent
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="onDrop"
                >
                  <div class="d-flex flex-column align-center justify-center pa-4 text-center">
                    <v-icon size="50" class="mb-2">mdi-cloud-upload-outline</v-icon>
                    <span>Drag and drop files here</span>
                    <span class="text-caption my-2">or</span>
                    <span class="text-primary font-weight-bold" style="cursor: pointer;">Browse files</span>
                  </div>
                </label>
                <v-file-input
                  id="audio-file-input"
                  v-model="audioForm.file"
                  scrim="primary"
                  class="d-none"
                  accept="audio/*"
                  :disabled="isSubmitting"
                />
                <div v-if="audioForm.file" class="mt-2">
                  <v-chip
                    size="small"
                    label
                    color="primary"
                    class="me-2"
                    closable
                    @click:close="removeFile"
                  >
                    {{ audioForm.file.name }}
                  </v-chip>
                </div>
                <div class="text-xs text-gray-500 mt-1">You can select one audio file</div>
              </div>
              
              <div class="mb-4">
                <v-textarea
                  label="Transcription"
                  v-model="audioForm.transcription"
                  rows="4"
                  :disabled="isSubmitting"
                  placeholder="Audio file transcription"
                  variant="outlined"
                  density="compact"
                ></v-textarea>
              </div>
              
              <div class="mb-4">
                <v-textarea
                  label="Ideas"
                  disabled
                  v-model="audioForm.ideas"
                  rows="4"
                  placeholder="Ideas and notes"
                  variant="outlined"
                  density="compact"
                ></v-textarea>
                <div class="text-xs text-gray-500 mt-1">You can use formatting</div>
              </div>
              
              <div class="mt-6">
                <button 
                  type="submit" 
                  :disabled="isSubmitting"
                  class="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
                >
                  {{ isSubmitting ? 'Loading...' : 'Create' }}
                </button>
              </div>

              <div v-if="responseJson" class="mt-4 p-4 bg-gray-100 rounded-md overflow-auto">
                <pre class="text-xs">{{ responseJson }}</pre>
              </div>
              
              <div v-if="transcribeResponseJson" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-md overflow-auto">
                <h4 class="text-sm font-bold text-green-700 mb-2">Transcription Result:</h4>
                <pre class="text-xs">{{ transcribeResponseJson }}</pre>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <!-- Audio List -->
      <div class="lg:col-span-8">
        <div class="bg-white rounded-lg shadow-md p-4 mb-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-800">Your Audio Files</h2>
            <button
              class="px-4 py-2 bg-blue-600 text-white font-medium rounded-md"
              :disabled="loading || backgroundLoading"
              @click="fetchAudioSources"
            >
              {{ (loading || backgroundLoading) ? 'Loading...' : 'Refresh' }}
            </button>
          </div>
          
          <v-progress-linear
            v-if="backgroundLoading"
            indeterminate
            color="primary"
            class="mb-4"
          ></v-progress-linear>

          <div v-if="loading" class="text-center py-8">
            <p>Loading...</p>
          </div>

          <div v-else-if="!audioSources.length" class="text-center py-8">
            <p>No audio files yet</p>
          </div>
          
          <div v-else class="space-y-6">
            <div 
              v-for="audio in audioSources" 
              :key="audio.documentId || audio.id"
              class="bg-white rounded-lg shadow overflow-hidden transition-all hover:shadow-md p-4"
            >
              <div class="flex justify-between">
                <h3 class="text-xl font-semibold text-gray-800">{{ getAudioTitle(audio) }}</h3>
                <div class="flex space-x-2">
                  <button
                    v-if="['new', 'transcribing', 'working_failed'].includes(getAudioWorkStatus(audio)) || !getAudioWorkStatus(audio)"
                    class="px-2 py-1 bg-green-600 text-white rounded-md"
                    @click="handleTranscribe(audio.documentId || audio.id)"
                    :disabled="getAudioWorkStatus(audio) === 'transcribing' || transcribingId === (audio.documentId || audio.id)"
                  >
                    {{ (getAudioWorkStatus(audio) === 'transcribing' || transcribingId === (audio.documentId || audio.id)) ? 'Transcribing...' : 'Transcribe' }}
                  </button>
                  <button 
                    class="px-2 py-1 bg-red-600 text-white rounded-md"
                    @click="handleDelete(audio.documentId || audio.id)"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div v-if="getAudioWorkStatus(audio) === 'working_failed'" class="mt-2 text-red-600 text-sm">
                <v-icon color="red" small>mdi-alert-circle-outline</v-icon>
                An error occurred during processing. Please try again.
              </div>
              
              <div v-if="getAudioFiles(audio).length > 0" class="mt-4">
                <div 
                  v-for="file in getAudioFiles(audio)" 
                  :key="file.id"
                  class="mb-3"
                >
                  <div class="flex items-center justify-between mb-1">
                    <div class="text-sm text-gray-600">{{ getFileName(file) }}</div>
                  </div>
                  <audio 
                    v-if="getAudioWorkStatus(audio) === 'new' || !getAudioWorkStatus(audio)"
                    controls
                    class="w-full"
                    :src="getBaseUrl() + getFileUrl(file)"
                  ></audio>
                </div>
              </div>
              
              <div v-if="getAudioTranscription(audio)" class="mt-4 pt-3 border-t border-gray-100">
                <h4 class="text-sm font-medium text-gray-700 mb-2">Transcription:</h4>
                <p class="text-gray-600 text-sm">{{ getAudioTranscription(audio) }}</p>
              </div>
              
              <div v-if="getAudioIdeas(audio)" class="mt-4 pt-3 border-t border-gray-100">
                <h4 class="text-sm font-medium text-gray-700 mb-2">Ideas:</h4>
                <div class="text-gray-600 text-sm" v-html="getAudioIdeas(audio)"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="dialogVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-medium text-gray-900 mb-4">{{ dialogConfig.title }}</h3>
        <p class="text-gray-600 mb-6">{{ dialogConfig.message }}</p>
        <div class="flex justify-end">
          <button 
            class="mr-2 px-4 py-2 bg-gray-200 rounded-md"
            @click="dialogVisible = false"
          >
            Cancel
          </button>
          <button 
            class="px-4 py-2 bg-red-600 text-white rounded-md"
            @click="confirmDelete" 
            :disabled="isDeleting"
          >
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="top"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="snackbar.show = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import httpService from '@/core/api/http';

export default defineComponent({
  name: 'AudioManager',
  
  setup() {
    // Store
    const store = useStore();
    
    // Refs
    const audioForm = reactive({
      title: '',
      transcription: '',
      ideas: '',
      file: null as File | null
    });
    
    const isSubmitting = ref(false);
    const isDeleting = ref(false);
    const dialogVisible = ref(false);
    const dialogConfig = reactive({
      title: '',
      message: ''
    });
    const currentDeleteId = ref<string | null>(null);
    const responseJson = ref('');
    const transcribeResponseJson = ref('');
    const isDragging = ref(false);
    const transcribingId = ref<string | number | null>(null);
    
    const snackbar = reactive({
      show: false,
      message: '',
      color: 'success',
      timeout: 2000
    });
    
    // Computed
    const audioSources = computed(() => store.getters['audio/audioSources']);
    const loading = computed(() => store.getters['audio/isLoading']);
    const backgroundLoading = computed(() => store.getters['audio/isBackgroundLoading']);
    const error = computed(() => store.state.audio.error);
    
    // Methods
    function showSnackbar(message: string, color: string = 'success', timeout: number = 2000): void {
      snackbar.message = message;
      snackbar.color = color;
      snackbar.timeout = timeout;
      snackbar.show = true;
    }
    
    function getBaseUrl(): string {
      return httpService.getBaseUrl();
    }
    
    const onDrop = (e: DragEvent) => {
      isDragging.value = false;
      if (e.dataTransfer && e.dataTransfer.files.length) {
        audioForm.file = e.dataTransfer.files[0];
      }
    };

    const removeFile = () => {
      audioForm.file = null;
    };
    
    // Helper methods for direct access to audio properties (Strapi v5 format)
    function getAudioTitle(audio: any): string {
      if (!audio) return 'Unknown';
      return audio.title || 'Untitled Audio';
    }
    
    function getAudioWorkStatus(audio: any): string {
      if (!audio) return '';
      return audio.work_status || '';
    }
    
    function getAudioTranscription(audio: any): string {
      if (!audio) return '';
      return audio.transcription || '';
    }
    
    function getAudioIdeas(audio: any): string {
      if (!audio) return '';
      return audio.ideas || '';
    }
    
    function getAudioFiles(audio: any): any[] {
      if (!audio) return [];
      
      // Direct files array
      if (Array.isArray(audio.audio_file)) {
        return audio.audio_file;
      }
      
      // Nested in data property (for relations)
      if (audio.audio_file && audio.audio_file.data && Array.isArray(audio.audio_file.data)) {
        return audio.audio_file.data;
      }
      
      return [];
    }
    
    function getFileName(file: any): string {
      if (!file) return 'Unknown';
      return file.name || 'Unnamed File';
    }
    
    function getFileUrl(file: any): string {
      if (!file) return '';
      return file.url || '';
    }
    
    function getFileSize(file: any): string {
      if (!file || typeof file.size !== 'number') return '0';
      return (file.size / 1024 / 1024).toFixed(2);
    }
    
    async function handleSubmit(): Promise<void> {
      if (!audioForm.title) {
        showSnackbar('Необходимо указать заголовок', 'error', 2000);
        return;
      }
      
      isSubmitting.value = true;
      responseJson.value = '';
      
      try {
        let uploadedFileIds: number[] = [];
        
        // Step 1: Upload files if they exist
        if (audioForm.file) {
          const uploadedFiles = await store.dispatch('audio/uploadFiles', [audioForm.file]);
          uploadedFileIds = uploadedFiles.map((file: any) => file.id);
          console.log('IDs загруженных файлов:', uploadedFileIds);
        }
        
        // Step 2: Create audio source with file references
        const requestData = {
          title: audioForm.title,
          transcription: audioForm.transcription || '',
          ideas: audioForm.ideas || '',
          audio_file: uploadedFileIds
        };
        
        console.log('Создание записи с данными:', requestData);
        
        const response = await store.dispatch('audio/createAudioSource', requestData);
        
        responseJson.value = JSON.stringify(response, null, 2);
        console.log('Запись успешно создана:', response);
        
        // Reset form
        audioForm.title = '';
        audioForm.transcription = '';
        audioForm.ideas = '';
        audioForm.file = null;
        
        showSnackbar('Audio successfully added', 'success', 2000);
      } catch (error: any) {
        console.error('Error:', error);
        if (error.response) {
          responseJson.value = JSON.stringify(error.response.data, null, 2);
        } else {
          responseJson.value = JSON.stringify(error.message, null, 2);
        }
        showSnackbar('Error creating audio file. See details below.', 'error', 2000);
      } finally {
        isSubmitting.value = false;
      }
    }
    
    async function fetchAudioSources(): Promise<void> {
      try {
        await store.dispatch('audio/fetchAudioSources');
      } catch (error) {
        console.error(error);
        showSnackbar('Error loading audio files', 'error', 2000);
      }
    }
    
    function handleDelete(documentId: string): void {
      dialogVisible.value = true;
      dialogConfig.title = 'Confirm Deletion';
      dialogConfig.message = 'Are you sure you want to delete this audio file? This action cannot be undone.';
      currentDeleteId.value = documentId;
    }
    
    async function confirmDelete(): Promise<void> {
      if (!currentDeleteId.value) return;
      
      isDeleting.value = true;
      
      try {
        await store.dispatch('audio/deleteAudioSource', currentDeleteId.value);
        showSnackbar('Audio file deleted', 'success', 2000);
      } catch (error) {
        console.error(error);
        showSnackbar('Error deleting audio file', 'error', 2000);
      } finally {
        isDeleting.value = false;
        dialogVisible.value = false;
        currentDeleteId.value = null;
      }
    }
    
    async function handleTranscribe(documentId: string): Promise<void> {
      if (!documentId) return;
      
      transcribeResponseJson.value = '';
      transcribingId.value = documentId;
      
      try {
        const response = await store.dispatch('audio/transcribeAudioSource', documentId);
        
        console.log('Результат транскрибирования:', response);
        transcribeResponseJson.value = JSON.stringify(response, null, 2);
        
        // Refresh audio list to get updated transcription
        await fetchAudioSources();
        
        showSnackbar('Transcription completed successfully', 'success', 2000);
      } catch (error: any) {
        console.error('Error transcribing:', error);
        
        if (error.response) {
          transcribeResponseJson.value = JSON.stringify(error.response.data, null, 2);
        } else {
          transcribeResponseJson.value = JSON.stringify(error.message, null, 2);
        }
        
        showSnackbar('Error transcribing audio', 'error', 2000);
      } finally {
        transcribingId.value = null;
      }
    }
    
    // Mount
    onMounted(() => {
      fetchAudioSources();
    });
    
    return {
      audioForm,
      isSubmitting,
      loading,
      backgroundLoading,
      isDeleting,
      dialogVisible,
      dialogConfig,
      audioSources,
      responseJson,
      transcribeResponseJson,
      snackbar,
      showSnackbar,
      getBaseUrl,
      handleSubmit,
      fetchAudioSources,
      handleDelete,
      handleTranscribe,
      confirmDelete,
      isDragging,
      onDrop,
      removeFile,
      transcribingId,
      // Helper methods
      getAudioTitle,
      getAudioWorkStatus,
      getAudioTranscription,
      getAudioIdeas,
      getAudioFiles,
      getFileName,
      getFileUrl,
      getFileSize
    };
  }
});
</script>

<style scoped>
.file-drop-zone {
  display: block;
  border: 2px dashed #ccc;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}
.file-drop-zone:hover {
  border-color: #aaa;
}
.file-drop-zone.is-dragging {
  border-color: #2196F3; /* Vuetify primary blue */
  background-color: rgba(33, 150, 243, 0.1);
}
</style>