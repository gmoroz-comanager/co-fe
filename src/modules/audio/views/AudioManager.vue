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
                <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title:</label>
                <input 
                  id="title" 
                  v-model="audioForm.title" 
                  placeholder="Enter title"
                  :disabled="isSubmitting"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div class="mb-4">
                <label for="audio_file" class="block text-sm font-medium text-gray-700 mb-1">Audio File(s):</label>
                <input 
                  type="file" 
                  id="audio_file" 
                  @change="handleFileUpload"
                  multiple
                  accept="audio/*"
                  :disabled="isSubmitting"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <div class="text-xs text-gray-500 mt-1">You can select multiple audio files (maximum 5)</div>
              </div>
              
              <div class="mb-4">
                <label for="transcription" class="block text-sm font-medium text-gray-700 mb-1">Transcription:</label>
                <textarea 
                  id="transcription" 
                  v-model="audioForm.transcription" 
                  rows="4"
                  :disabled="isSubmitting"
                  placeholder="Audio file transcription"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                ></textarea>
              </div>
              
              <div class="mb-4">
                <label for="ideas" class="block text-sm font-medium text-gray-700 mb-1">Ideas:</label>
                <textarea 
                  id="ideas" 
                  v-model="audioForm.ideas" 
                  rows="4"
                  :disabled="isSubmitting"
                  placeholder="Ideas and notes"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                ></textarea>
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
              :disabled="loading" 
              @click="fetchAudioSources"
            >
              {{ loading ? 'Loading...' : 'Refresh' }}
            </button>
          </div>
          
          <div v-if="!loading && !audioSources.length" class="text-center py-8">
            <p>No audio files yet</p>
          </div>
          
          <div v-else-if="loading" class="text-center py-8">
            <p>Loading...</p>
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
                    class="px-2 py-1 bg-green-600 text-white rounded-md"
                    @click="handleTranscribe(audio.documentId || audio.id)"
                    :disabled="getAudioWorkStatus(audio) === 'transcribing'"
                  >
                    {{ getAudioWorkStatus(audio) === 'transcribing' ? 'Transcribing...' : 'Transcribe' }}
                  </button>
                  <button 
                    class="px-2 py-1 bg-red-600 text-white rounded-md"
                    @click="handleDelete(audio.documentId || audio.id)"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div v-if="getAudioFiles(audio).length > 0" class="mt-4">
                <div 
                  v-for="file in getAudioFiles(audio)" 
                  :key="file.id"
                  class="mb-3"
                >
                  <div class="flex items-center justify-between mb-1">
                    <div class="text-sm text-gray-600">{{ getFileName(file) }}</div>
                    <div class="text-xs text-gray-500">{{ getFileSize(file) }} MB</div>
                  </div>
                  <audio 
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
      files: [] as File[]
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
    
    // Computed
    const audioSources = computed(() => store.getters['audio/audioSources']);
    const loading = computed(() => store.getters['audio/isLoading']);
    const error = computed(() => store.state.audio.error);
    
    // Methods
    function getBaseUrl(): string {
      return httpService.getBaseUrl();
    }
    
    function handleFileUpload(event: Event): void {
      const target = event.target as HTMLInputElement;
      if (target.files) {
        audioForm.files = Array.from(target.files);
      }
    }
    
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
        alert('Необходимо указать заголовок');
        return;
      }
      
      isSubmitting.value = true;
      responseJson.value = '';
      
      try {
        let uploadedFileIds: number[] = [];
        
        // Step 1: Upload files if they exist
        if (audioForm.files && audioForm.files.length > 0) {
          const uploadedFiles = await store.dispatch('audio/uploadFiles', audioForm.files);
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
        audioForm.files = [];
        
        alert('Audio successfully added');
      } catch (error: any) {
        console.error('Error:', error);
        if (error.response) {
          responseJson.value = JSON.stringify(error.response.data, null, 2);
        } else {
          responseJson.value = JSON.stringify(error.message, null, 2);
        }
        alert('Error creating audio file. See details below.');
      } finally {
        isSubmitting.value = false;
      }
    }
    
    async function fetchAudioSources(): Promise<void> {
      try {
        await store.dispatch('audio/fetchAudioSources');
      } catch (error) {
        console.error(error);
        alert('Error loading audio files');
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
        alert('Audio file deleted');
      } catch (error) {
        console.error(error);
        alert('Error deleting audio file');
      } finally {
        isDeleting.value = false;
        dialogVisible.value = false;
        currentDeleteId.value = null;
      }
    }
    
    async function handleTranscribe(documentId: string): Promise<void> {
      if (!documentId) return;
      
      transcribeResponseJson.value = '';
      
      try {
        const response = await store.dispatch('audio/transcribeAudioSource', documentId);
        
        console.log('Результат транскрибирования:', response);
        transcribeResponseJson.value = JSON.stringify(response, null, 2);
        
        // Refresh audio list to get updated transcription
        await fetchAudioSources();
        
        alert('Transcription completed successfully');
      } catch (error: any) {
        console.error('Error transcribing:', error);
        
        if (error.response) {
          transcribeResponseJson.value = JSON.stringify(error.response.data, null, 2);
        } else {
          transcribeResponseJson.value = JSON.stringify(error.message, null, 2);
        }
        
        alert('Error transcribing audio');
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
      isDeleting,
      dialogVisible,
      dialogConfig,
      audioSources,
      responseJson,
      transcribeResponseJson,
      getBaseUrl,
      handleFileUpload,
      handleSubmit,
      fetchAudioSources,
      handleDelete,
      handleTranscribe,
      confirmDelete,
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