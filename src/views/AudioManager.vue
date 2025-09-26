<template>
  <div class="container mx-auto p-6 max-w-7xl">
    <h1 class="text-3xl font-bold mb-8">Управление аудио</h1>
    
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <!-- Audio Creation Form -->
      <div class="lg:col-span-4">
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-800">Добавить новый аудиофайл</h2>
          </div>
          <div class="p-4">
            <form @submit.prevent="handleSubmit">
              <div class="mb-4">
                <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Заголовок:</label>
                <input 
                  id="title" 
                  v-model="audioForm.title" 
                  placeholder="Введите заголовок"
                  :disabled="isSubmitting"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div class="mb-4">
                <label for="audio_file" class="block text-sm font-medium text-gray-700 mb-1">Аудиофайл(ы):</label>
                <input 
                  type="file" 
                  id="audio_file" 
                  @change="handleFileUpload"
                  multiple
                  accept="audio/*"
                  :disabled="isSubmitting"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <div class="text-xs text-gray-500 mt-1">Можно выбрать несколько аудиофайлов (максимум 5)</div>
              </div>
              
              <div class="mb-4">
                <label for="transcription" class="block text-sm font-medium text-gray-700 mb-1">Транскрипция:</label>
                <textarea 
                  id="transcription" 
                  v-model="audioForm.transcription" 
                  rows="4"
                  :disabled="isSubmitting"
                  placeholder="Транскрипция аудиофайла"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                ></textarea>
              </div>
              
              <div class="mb-4">
                <label for="ideas" class="block text-sm font-medium text-gray-700 mb-1">Идеи:</label>
                <textarea 
                  id="ideas" 
                  v-model="audioForm.ideas" 
                  rows="4"
                  :disabled="isSubmitting"
                  placeholder="Идеи и заметки"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                ></textarea>
                <div class="text-xs text-gray-500 mt-1">Можно использовать форматирование</div>
              </div>
              
              <div class="mt-6">
                <button 
                  type="submit" 
                  :disabled="isSubmitting"
                  class="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
                >
                  {{ isSubmitting ? 'Загрузка...' : 'Создать' }}
                </button>
              </div>

              <div v-if="responseJson" class="mt-4 p-4 bg-gray-100 rounded-md overflow-auto">
                <pre class="text-xs">{{ responseJson }}</pre>
              </div>
              
              <div v-if="transcribeResponseJson" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-md overflow-auto">
                <h4 class="text-sm font-bold text-green-700 mb-2">Результат транскрибирования:</h4>
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
            <h2 class="text-xl font-semibold text-gray-800">Ваши аудиофайлы</h2>
            <button 
              class="px-4 py-2 bg-blue-600 text-white font-medium rounded-md"
              :disabled="isLoading" 
              @click="fetchAudioSources"
            >
              {{ isLoading ? 'Загрузка...' : 'Обновить' }}
            </button>
          </div>
          
          <div v-if="!isLoading && !audioSources.length" class="text-center py-8">
            <p>Аудиофайлов еще нет</p>
          </div>
          
          <div v-else-if="isLoading" class="text-center py-8">
            <p>Загрузка...</p>
          </div>
          
          <div v-else class="space-y-6">
            <div 
              v-for="audio in audioSources" 
              :key="audio.documentId || audio.id"
              class="bg-white rounded-lg shadow overflow-hidden transition-all hover:shadow-md p-4"
            >
              <div class="flex justify-between">
                <h3 class="text-xl font-semibold text-gray-800">{{ audio.title }}</h3>
                <div class="flex space-x-2">
                  <button 
                    class="px-2 py-1 bg-green-600 text-white rounded-md"
                    @click="handleTranscribe(audio.documentId || audio.id)"
                    :disabled="audio.work_status === 'transcribing'"
                  >
                    {{ audio.work_status === 'transcribing' ? 'Транскрибирование...' : 'Transcribe' }}
                  </button>
                  <button 
                    class="px-2 py-1 bg-red-600 text-white rounded-md"
                    @click="handleDelete(audio.documentId || audio.id)"
                  >
                    Удалить
                  </button>
                </div>
              </div>
              
              <div v-if="audio.audio_file && audio.audio_file.length > 0" class="mt-4">
                <div 
                  v-for="file in audio.audio_file" 
                  :key="file.id"
                  class="mb-3"
                >
                  <div class="flex items-center justify-between mb-1">
                    <div class="text-sm text-gray-600">{{ file.name }}</div>
                    <div class="text-xs text-gray-500">{{ (file.size / 1024 / 1024).toFixed(2) }} MB</div>
                  </div>
                  <audio 
                    controls
                    class="w-full"
                    :src="getApiBaseUrl() + file.url"
                  ></audio>
                </div>
              </div>
              
              <div v-if="audio.transcription" class="mt-4 pt-3 border-t border-gray-100">
                <h4 class="text-sm font-medium text-gray-700 mb-2">Транскрипция:</h4>
                <p class="text-gray-600 text-sm">{{ audio.transcription }}</p>
              </div>
              
              <div v-if="audio.ideas" class="mt-4 pt-3 border-t border-gray-100">
                <h4 class="text-sm font-medium text-gray-700 mb-2">Идеи:</h4>
                <div class="text-gray-600 text-sm" v-html="audio.ideas"></div>
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
            Отмена
          </button>
          <button 
            class="px-4 py-2 bg-red-600 text-white rounded-md"
            @click="confirmDelete" 
            :disabled="isDeleting"
          >
            {{ isDeleting ? 'Удаление...' : 'Удалить' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';

export default {
  name: 'AudioManager',
  setup() {
    // Store
    const store = useStore();
    
    // Refs
    const uploadRef = ref(null);
    const audioForm = reactive({
      title: '',
      transcription: '',
      ideas: '',
      files: []
    });
    
    const isSubmitting = ref(false);
    const isLoading = ref(false);
    const isDeleting = ref(false);
    // Removed global isTranscribing ref - using audio.work_status instead
    const dialogVisible = ref(false);
    const dialogConfig = reactive({
      title: '',
      message: ''
    });
    const currentDeleteId = ref(null);
    const responseJson = ref('');
    const transcribeResponseJson = ref('');
    
    // Computed
    const audioSources = computed(() => store.getters.audioSources);
    
    // Methods
    function getApiBaseUrl() {
      const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:1337/api';
      return apiUrl.replace(/\/api$/, '');
    }
    
    function getApiUrl() {
      return process.env.VUE_APP_API_URL || 'http://localhost:1337/api';
    }
    
    function handleFileUpload(event) {
      audioForm.files = [...event.target.files];
    }
    
    // Функция для загрузки файлов в медиабиблиотеку Strapi
    async function uploadFiles(files) {
      try {
        const formData = new FormData();
        
        for (let i = 0; i < files.length; i++) {
          formData.append('files', files[i]);
        }
        
        const token = localStorage.getItem('token');
        
        // Загружаем файлы через API загрузки
        const response = await axios.post(
          `${getApiUrl()}/upload`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        console.log('Файлы успешно загружены:', response.data);
        
        // Возвращаем массив ID загруженных файлов
        return response.data.map(file => file.id);
      } catch (error) {
        console.error('Ошибка при загрузке файлов:', error);
        throw error;
      }
    }
    
    async function handleSubmit() {
      if (!audioForm.title) {
        alert('Необходимо указать заголовок');
        return;
      }
      
      isSubmitting.value = true;
      responseJson.value = '';
      
      try {
        let uploadedFileIds = [];
        
        // Шаг 1: Загрузка файлов, если они есть
        if (audioForm.files && audioForm.files.length > 0) {
          uploadedFileIds = await uploadFiles(audioForm.files);
          console.log('IDs загруженных файлов:', uploadedFileIds);
        }
        
        // Шаг 2: Создание записи с ссылками на файлы
        const requestData = {
          data: {
            title: audioForm.title,
            transcription: audioForm.transcription || '',
            ideas: audioForm.ideas || '',
            audio_file: uploadedFileIds // Ссылки на загруженные файлы
          }
        };
        
        console.log('Создание записи с данными:', requestData);
        
        const token = localStorage.getItem('token');
        
        // Создаем запись
        const response = await axios.post(
          `${getApiUrl()}/audio-sources`,
          requestData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        responseJson.value = JSON.stringify(response.data, null, 2);
        console.log('Запись успешно создана:', response.data);
        
        // Сбрасываем форму
        audioForm.title = '';
        audioForm.transcription = '';
        audioForm.ideas = '';
        audioForm.files = [];
        
        alert('Аудио успешно добавлено');
        // Обновляем список
        fetchAudioSources();
      } catch (error) {
        console.error('Ошибка:', error);
        if (error.response) {
          responseJson.value = JSON.stringify(error.response.data, null, 2);
        } else {
          responseJson.value = JSON.stringify(error.message, null, 2);
        }
        alert('Ошибка при создании аудиофайла. Смотрите детали ниже.');
      } finally {
        isSubmitting.value = false;
      }
    }
    
    async function fetchAudioSources() {
      isLoading.value = true;
      
      try {
        await store.dispatch('fetchAudioSources');
      } catch (error) {
        console.error(error);
        alert('Ошибка загрузки аудиофайлов');
      } finally {
        isLoading.value = false;
      }
    }
    
    // Обновлено: используем documentId вместо id
    function handleDelete(documentId) {
      dialogVisible.value = true;
      dialogConfig.title = 'Подтвердите удаление';
      dialogConfig.message = 'Вы уверены, что хотите удалить этот аудиофайл? Это действие невозможно отменить.';
      currentDeleteId.value = documentId;
    }
    
    // Обновлено: используем documentId вместо id
    async function confirmDelete() {
      if (!currentDeleteId.value) return;
      
      isDeleting.value = true;
      
      try {
        await store.dispatch('deleteAudioSource', currentDeleteId.value);
        alert('Аудиофайл удален');
        fetchAudioSources();
      } catch (error) {
        console.error(error);
        alert('Ошибка при удалении аудиофайла');
      } finally {
        isDeleting.value = false;
        dialogVisible.value = false;
        currentDeleteId.value = null;
      }
    }
    
    // Обновлено: используем documentId вместо id и store action
    async function handleTranscribe(documentId) {
      if (!documentId) return;
      
      transcribeResponseJson.value = '';
      
      try {
        // Используем новый метод из store
        const response = await store.dispatch('transcribeAudioSource', documentId);
        
        console.log('Результат транскрибирования:', response.data);
        transcribeResponseJson.value = JSON.stringify(response.data, null, 2);
        
        // Обновляем список аудиозаписей, чтобы получить обновленную транскрипцию
        fetchAudioSources();
        
        // Показываем уведомление об успешном транскрибировании
        alert('Транскрибирование завершено успешно');
      } catch (error) {
        console.error('Ошибка при транскрибировании:', error);
        
        if (error.response) {
          transcribeResponseJson.value = JSON.stringify(error.response.data, null, 2);
        } else {
          transcribeResponseJson.value = JSON.stringify(error.message, null, 2);
        }
        
        alert('Ошибка при транскрибировании аудио');
      } finally {
        // No need to reset isTranscribing as we're using work_status
      }
    }
    
    // Mount
    onMounted(() => {
      fetchAudioSources();
    });
    
    return {
      uploadRef,
      audioForm,
      isSubmitting,
      isLoading,
      isDeleting,
      // isTranscribing removed,
      dialogVisible,
      dialogConfig,
      audioSources,
      responseJson,
      transcribeResponseJson,
      getApiBaseUrl,
      handleFileUpload,
      handleSubmit,
      fetchAudioSources,
      handleDelete,
      handleTranscribe,
      confirmDelete
    };
  }
};
</script>