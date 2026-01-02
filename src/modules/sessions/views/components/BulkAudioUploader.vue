<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="700" persistent>
    <v-card class="bulk-uploader-card">
      <v-card-title class="d-flex align-center justify-space-between">
        <span>Add Audio Sources</span>
        <v-btn icon variant="text" size="small" @click="handleClose" :disabled="isUploading || isSubmittingTranscript || isSubmittingTextFiles">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <!-- Mode Tabs -->
        <v-tabs v-model="inputMode" class="mb-4" :disabled="isUploading || isSubmittingTranscript || isSubmittingTextFiles">
          <v-tab value="audio">
            <v-icon start>mdi-file-music</v-icon>
            Audio Files
          </v-tab>
          <v-tab value="text-files">
            <v-icon start>mdi-file-document-multiple</v-icon>
            Text Files
          </v-tab>
          <v-tab value="transcript">
            <v-icon start>mdi-text-box</v-icon>
            Paste Text
          </v-tab>
        </v-tabs>

        <!-- Audio Upload Mode -->
        <template v-if="inputMode === 'audio'">
          <!-- Default Source Type -->
          <v-select
            v-model="defaultSourceType"
            :items="sourceTypeOptions"
            label="Default Source Type"
            variant="outlined"
            density="compact"
            class="mb-4"
            :disabled="isUploading"
          />

          <!-- Drop Zone -->
          <div
            class="drop-zone"
            :class="{ 
              dragging: isDragging, 
              'has-files': pendingFiles.length > 0,
              disabled: isUploading 
            }"
            @dragenter.prevent="onDragEnter"
            @dragover.prevent
            @dragleave.prevent="onDragLeave"
            @drop.prevent="onDrop"
            @click="triggerFileInput"
          >
            <input
              ref="fileInput"
              type="file"
              accept="audio/*"
              multiple
              class="d-none"
              @change="onFileSelect"
              :disabled="isUploading"
            />
            
            <template v-if="pendingFiles.length === 0">
              <v-icon size="64" color="primary" class="mb-3">mdi-cloud-upload-outline</v-icon>
              <p class="drop-title">Drag & drop audio files here</p>
              <p class="drop-hint">or click to browse</p>
              <p class="drop-formats">Supported formats: MP3, WAV, M4A, OGG, FLAC</p>
            </template>
            
            <template v-else>
              <v-icon size="48" color="success" class="mb-2">mdi-check-circle-outline</v-icon>
              <p class="drop-title">{{ pendingFiles.length }} file(s) selected</p>
              <p class="drop-hint">Click to add more files</p>
            </template>
          </div>

          <!-- File List -->
          <div v-if="pendingFiles.length > 0" class="file-list">
            <div class="file-list-header">
              <span>Files to upload</span>
              <v-btn 
                variant="text" 
                size="small" 
                color="error" 
                @click="clearAllFiles"
                :disabled="isUploading"
              >
                Clear All
              </v-btn>
            </div>

            <div class="file-items">
              <div
                v-for="(file, index) in pendingFiles"
                :key="file.id"
                class="file-item"
                :class="{ 
                  uploading: file.status === 'uploading',
                  completed: file.status === 'completed',
                  error: file.status === 'error'
                }"
              >
                <div class="file-icon">
                  <v-icon v-if="file.status === 'pending'" color="grey">mdi-file-music</v-icon>
                  <v-icon v-else-if="file.status === 'uploading'" color="primary">mdi-upload</v-icon>
                  <v-icon v-else-if="file.status === 'completed'" color="success">mdi-check-circle</v-icon>
                  <v-icon v-else-if="file.status === 'error'" color="error">mdi-alert-circle</v-icon>
                </div>

                <div class="file-info">
                  <v-text-field
                    v-model="file.title"
                    variant="plain"
                    density="compact"
                    hide-details
                    class="file-title-input"
                    :disabled="file.status !== 'pending'"
                    placeholder="Enter title"
                  />
                  <div class="file-meta">
                    <span class="file-size">{{ formatFileSize(file.file.size) }}</span>
                    <v-select
                      v-model="file.source_type"
                      :items="sourceTypeOptions"
                      variant="plain"
                      density="compact"
                      hide-details
                      class="file-type-select"
                      :disabled="file.status !== 'pending'"
                    />
                  </div>
                  
                  <!-- Progress Bar -->
                  <v-progress-linear
                    v-if="file.status === 'uploading'"
                    :model-value="file.progress"
                    color="primary"
                    height="4"
                    rounded
                    class="mt-2"
                  />
                  
                  <!-- Error Message -->
                  <div v-if="file.status === 'error'" class="file-error">
                    {{ file.error }}
                  </div>
                </div>

                <div class="file-actions">
                  <v-btn
                    v-if="file.status === 'pending'"
                    icon
                    variant="text"
                    size="small"
                    @click="removeFile(index)"
                  >
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                  <span v-else-if="file.status === 'uploading'" class="progress-text">
                    {{ file.progress }}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Upload Summary -->
          <div v-if="uploadSummary" class="upload-summary" :class="uploadSummary.type">
            <v-icon :color="uploadSummary.type === 'success' ? 'success' : 'error'" class="mr-2">
              {{ uploadSummary.type === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
            </v-icon>
            <span>{{ uploadSummary.message }}</span>
          </div>
        </template>

        <!-- Text Files Mode -->
        <template v-else-if="inputMode === 'text-files'">
          <!-- Default Source Type for Text Files -->
          <v-select
            v-model="textFilesSourceType"
            :items="sourceTypeOptions"
            label="Default Source Type"
            variant="outlined"
            density="compact"
            class="mb-4"
            :disabled="isSubmittingTextFiles"
          />

          <!-- Text Files Drop Zone -->
          <div
            class="drop-zone"
            :class="{ 
              dragging: isTextFilesDragging, 
              'has-files': pendingTextFiles.length > 0,
              disabled: isSubmittingTextFiles 
            }"
            @dragenter.prevent="onTextFilesDragEnter"
            @dragover.prevent
            @dragleave.prevent="onTextFilesDragLeave"
            @drop.prevent="onTextFilesDrop"
            @click="triggerTextFileInput"
          >
            <input
              ref="textFileInput"
              type="file"
              accept=".txt,text/plain"
              multiple
              class="d-none"
              @change="onTextFileSelect"
              :disabled="isSubmittingTextFiles"
            />
            
            <template v-if="pendingTextFiles.length === 0">
              <v-icon size="64" color="primary" class="mb-3">mdi-file-document-outline</v-icon>
              <p class="drop-title">Drag & drop text files here</p>
              <p class="drop-hint">or click to browse</p>
              <p class="drop-formats">Supported formats: .txt</p>
            </template>
            
            <template v-else>
              <v-icon size="48" color="success" class="mb-2">mdi-check-circle-outline</v-icon>
              <p class="drop-title">{{ pendingTextFiles.length }} file(s) selected</p>
              <p class="drop-hint">Click to add more files</p>
            </template>
          </div>

          <!-- Text File List -->
          <div v-if="pendingTextFiles.length > 0" class="file-list">
            <div class="file-list-header">
              <span>Files to process</span>
              <v-btn 
                variant="text" 
                size="small" 
                color="error" 
                @click="clearAllTextFiles"
                :disabled="isSubmittingTextFiles"
              >
                Clear All
              </v-btn>
            </div>

            <div class="file-items">
              <div
                v-for="(file, index) in pendingTextFiles"
                :key="file.id"
                class="file-item"
                :class="{ 
                  uploading: file.status === 'uploading',
                  completed: file.status === 'completed',
                  error: file.status === 'error'
                }"
              >
                <div class="file-icon">
                  <v-icon v-if="file.status === 'pending'" color="grey">mdi-file-document</v-icon>
                  <v-icon v-else-if="file.status === 'uploading'" color="primary">mdi-upload</v-icon>
                  <v-icon v-else-if="file.status === 'completed'" color="success">mdi-check-circle</v-icon>
                  <v-icon v-else-if="file.status === 'error'" color="error">mdi-alert-circle</v-icon>
                </div>

                <div class="file-info">
                  <v-text-field
                    v-model="file.title"
                    variant="plain"
                    density="compact"
                    hide-details
                    class="file-title-input"
                    :disabled="file.status !== 'pending'"
                    placeholder="Enter title"
                  />
                  <div class="file-meta">
                    <span class="file-size">{{ formatFileSize(file.file.size) }}</span>
                    <span class="text-caption text-grey ml-2">{{ file.charCount }} characters</span>
                    <v-select
                      v-model="file.source_type"
                      :items="sourceTypeOptions"
                      variant="plain"
                      density="compact"
                      hide-details
                      class="file-type-select"
                      :disabled="file.status !== 'pending'"
                    />
                  </div>
                  
                  <!-- Error Message -->
                  <div v-if="file.status === 'error'" class="file-error">
                    {{ file.error }}
                  </div>
                </div>

                <div class="file-actions">
                  <v-btn
                    v-if="file.status === 'pending'"
                    icon
                    variant="text"
                    size="small"
                    @click="removeTextFile(index)"
                  >
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>
          </div>

          <!-- Text Files Summary -->
          <div v-if="textFilesSummary" class="upload-summary" :class="textFilesSummary.type">
            <v-icon :color="textFilesSummary.type === 'success' ? 'success' : 'error'" class="mr-2">
              {{ textFilesSummary.type === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
            </v-icon>
            <span>{{ textFilesSummary.message }}</span>
          </div>
        </template>

        <!-- Transcript Mode -->
        <template v-else>
          <v-text-field
            v-model="transcriptForm.title"
            label="Title"
            variant="outlined"
            density="compact"
            class="mb-4"
            :disabled="isSubmittingTranscript"
            placeholder="Enter source title"
          />

          <v-select
            v-model="transcriptForm.source_type"
            :items="sourceTypeOptions"
            label="Source Type"
            variant="outlined"
            density="compact"
            class="mb-4"
            :disabled="isSubmittingTranscript"
          />

          <v-textarea
            v-model="transcriptForm.transcription"
            label="Transcript Text"
            variant="outlined"
            rows="10"
            :disabled="isSubmittingTranscript"
            placeholder="Paste or type your transcript here..."
            class="mb-2"
          />

          <p class="text-caption text-grey mb-4">
            Paste text from a meeting transcript, interview notes, or any other text content.
          </p>

          <!-- Transcript Submit Status -->
          <div v-if="transcriptSubmitStatus" class="upload-summary" :class="transcriptSubmitStatus.type">
            <v-icon :color="transcriptSubmitStatus.type === 'success' ? 'success' : 'error'" class="mr-2">
              {{ transcriptSubmitStatus.type === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
            </v-icon>
            <span>{{ transcriptSubmitStatus.message }}</span>
          </div>
        </template>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn 
          variant="text" 
          @click="handleClose"
          :disabled="isUploading || isSubmittingTranscript || isSubmittingTextFiles"
        >
          {{ hasAnyCompletedUploads ? 'Close' : 'Cancel' }}
        </v-btn>
        
        <!-- Audio Mode Button -->
        <v-btn
          v-if="inputMode === 'audio'"
          color="primary"
          @click="uploadAll"
          :loading="isUploading"
          :disabled="pendingFiles.length === 0 || allFilesProcessed"
        >
          {{ uploadButtonText }}
        </v-btn>
        
        <!-- Text Files Mode Button -->
        <v-btn
          v-else-if="inputMode === 'text-files'"
          color="primary"
          @click="submitAllTextFiles"
          :loading="isSubmittingTextFiles"
          :disabled="pendingTextFiles.length === 0 || allTextFilesProcessed"
        >
          {{ textFilesButtonText }}
        </v-btn>
        
        <!-- Transcript Mode Button -->
        <v-btn
          v-else
          color="primary"
          @click="submitTranscript"
          :loading="isSubmittingTranscript"
          :disabled="!transcriptForm.title || !transcriptForm.transcription"
        >
          Add Source
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, watch } from 'vue';
import httpService from '@/core/api/http';

interface PendingFile {
  id: string;
  file: File;
  title: string;
  source_type: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
  uploadedFileId?: number;
}

interface PendingTextFile {
  id: string;
  file: File;
  title: string;
  source_type: string;
  content: string;
  charCount: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export default defineComponent({
  name: 'BulkAudioUploader',

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    sessionDocumentId: {
      type: String,
      required: true,
    },
  },

  emits: ['update:modelValue', 'uploaded', 'close'],

  setup(props, { emit }) {
    const fileInput = ref<HTMLInputElement | null>(null);
    const isDragging = ref(false);
    const dragCounter = ref(0);
    const defaultSourceType = ref('dialogue');
    const pendingFiles = ref<PendingFile[]>([]);
    const isUploading = ref(false);
    
    // Input mode: 'audio', 'text-files', or 'transcript'
    const inputMode = ref<'audio' | 'text-files' | 'transcript'>('audio');
    
    // Transcript form (paste text mode)
    const transcriptForm = reactive({
      title: '',
      source_type: 'dialogue',
      transcription: '',
    });
    const isSubmittingTranscript = ref(false);
    const transcriptSubmitStatus = ref<{ type: 'success' | 'error'; message: string } | null>(null);
    
    // Text files mode
    const textFileInput = ref<HTMLInputElement | null>(null);
    const isTextFilesDragging = ref(false);
    const textFilesDragCounter = ref(0);
    const textFilesSourceType = ref('dialogue');
    const pendingTextFiles = ref<PendingTextFile[]>([]);
    const isSubmittingTextFiles = ref(false);

    const sourceTypeOptions = [
      { title: 'Dialogue', value: 'dialogue' },
      { title: 'Chat', value: 'chat' },
      { title: 'Lecture', value: 'lecture' },
    ];

    const uploadSummary = computed(() => {
      if (!pendingFiles.value.length) return null;
      
      const completed = pendingFiles.value.filter(f => f.status === 'completed').length;
      const errors = pendingFiles.value.filter(f => f.status === 'error').length;
      const total = pendingFiles.value.length;
      
      if (completed === 0 && errors === 0) return null;
      
      if (errors === 0 && completed === total) {
        return {
          type: 'success',
          message: `All ${completed} file(s) uploaded successfully!`,
        };
      } else if (completed > 0 || errors > 0) {
        return {
          type: errors > 0 ? 'error' : 'success',
          message: `${completed} uploaded, ${errors} failed out of ${total} file(s)`,
        };
      }
      return null;
    });

    const hasCompletedUploads = computed(() => {
      return pendingFiles.value.some(f => f.status === 'completed');
    });

    const allFilesProcessed = computed(() => {
      return pendingFiles.value.length > 0 && 
        pendingFiles.value.every(f => f.status === 'completed' || f.status === 'error');
    });

    const uploadButtonText = computed(() => {
      const pending = pendingFiles.value.filter(f => f.status === 'pending').length;
      if (pending === 0 && pendingFiles.value.length > 0) {
        return 'All Done';
      }
      return `Upload ${pending} file(s)`;
    });
    
    // Text files computed
    const textFilesSummary = computed(() => {
      if (!pendingTextFiles.value.length) return null;
      
      const completed = pendingTextFiles.value.filter(f => f.status === 'completed').length;
      const errors = pendingTextFiles.value.filter(f => f.status === 'error').length;
      const total = pendingTextFiles.value.length;
      
      if (completed === 0 && errors === 0) return null;
      
      if (errors === 0 && completed === total) {
        return {
          type: 'success',
          message: `All ${completed} file(s) processed successfully!`,
        };
      } else if (completed > 0 || errors > 0) {
        return {
          type: errors > 0 ? 'error' : 'success',
          message: `${completed} processed, ${errors} failed out of ${total} file(s)`,
        };
      }
      return null;
    });
    
    const hasCompletedTextFiles = computed(() => {
      return pendingTextFiles.value.some(f => f.status === 'completed');
    });
    
    const allTextFilesProcessed = computed(() => {
      return pendingTextFiles.value.length > 0 && 
        pendingTextFiles.value.every(f => f.status === 'completed' || f.status === 'error');
    });
    
    const textFilesButtonText = computed(() => {
      const pending = pendingTextFiles.value.filter(f => f.status === 'pending').length;
      if (pending === 0 && pendingTextFiles.value.length > 0) {
        return 'All Done';
      }
      return `Process ${pending} file(s)`;
    });
    
    // Combined check for any completed uploads across all modes
    const hasAnyCompletedUploads = computed(() => {
      return hasCompletedUploads.value || 
        hasCompletedTextFiles.value || 
        transcriptSubmitStatus.value?.type === 'success';
    });

    const generateId = () => Math.random().toString(36).substring(2, 9);

    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const extractFileName = (file: File): string => {
      return file.name.replace(/\.[^/.]+$/, '');
    };

    const addFiles = (files: FileList | File[]) => {
      const audioFiles = Array.from(files).filter(file => file.type.startsWith('audio/'));
      
      for (const file of audioFiles) {
        // Check if file already exists
        const exists = pendingFiles.value.some(
          pf => pf.file.name === file.name && pf.file.size === file.size
        );
        
        if (!exists) {
          pendingFiles.value.push({
            id: generateId(),
            file,
            title: extractFileName(file),
            source_type: defaultSourceType.value,
            status: 'pending',
            progress: 0,
          });
        }
      }
    };

    const onDragEnter = (e: DragEvent) => {
      dragCounter.value++;
      isDragging.value = true;
    };

    const onDragLeave = (e: DragEvent) => {
      dragCounter.value--;
      if (dragCounter.value === 0) {
        isDragging.value = false;
      }
    };

    const onDrop = (e: DragEvent) => {
      isDragging.value = false;
      dragCounter.value = 0;
      
      if (isUploading.value) return;
      
      if (e.dataTransfer?.files) {
        addFiles(e.dataTransfer.files);
      }
    };

    const triggerFileInput = () => {
      if (isUploading.value) return;
      fileInput.value?.click();
    };

    const onFileSelect = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        addFiles(target.files);
        // Reset input so same file can be selected again
        target.value = '';
      }
    };

    const removeFile = (index: number) => {
      pendingFiles.value.splice(index, 1);
    };

    const clearAllFiles = () => {
      pendingFiles.value = [];
    };

    const uploadSingleFile = async (pendingFile: PendingFile): Promise<boolean> => {
      pendingFile.status = 'uploading';
      pendingFile.progress = 0;

      try {
        // Step 1: Upload the file
        const formData = new FormData();
        formData.append('files', pendingFile.file);

        const uploadResponse = await httpService.upload('/upload', formData, {
          onUploadProgress: (e: any) => {
            if (e.total) {
              // File upload is 80% of total progress
              pendingFile.progress = Math.round((e.loaded * 80) / e.total);
            }
          },
        });

        const uploadedFileIds = uploadResponse.data.map((f: any) => f.id);
        pendingFile.uploadedFileId = uploadedFileIds[0];
        pendingFile.progress = 85;

        // Step 2: Create audio source
        await httpService.post('/audio-sources', {
          data: {
            title: pendingFile.title,
            source_type: pendingFile.source_type,
            audio_file: uploadedFileIds,
            session: props.sessionDocumentId,
          },
        });

        pendingFile.progress = 100;
        pendingFile.status = 'completed';
        return true;
      } catch (error: any) {
        console.error('Upload error:', error);
        pendingFile.status = 'error';
        pendingFile.error = error.response?.data?.error?.message || error.message || 'Upload failed';
        return false;
      }
    };

    const uploadAll = async () => {
      const filesToUpload = pendingFiles.value.filter(f => f.status === 'pending');
      if (filesToUpload.length === 0) return;

      isUploading.value = true;

      // Upload files sequentially to show individual progress
      for (const file of filesToUpload) {
        await uploadSingleFile(file);
      }

      isUploading.value = false;

      // Emit uploaded event if any file was successfully uploaded
      const successCount = pendingFiles.value.filter(f => f.status === 'completed').length;
      if (successCount > 0) {
        emit('uploaded', successCount);
      }
    };

    const submitTranscript = async () => {
      if (!transcriptForm.title || !transcriptForm.transcription) return;
      
      isSubmittingTranscript.value = true;
      transcriptSubmitStatus.value = null;
      
      try {
        await httpService.post('/audio-sources', {
          data: {
            title: transcriptForm.title,
            source_type: transcriptForm.source_type,
            transcription: transcriptForm.transcription,
            work_status: 'transcribed', // Mark as already transcribed
            session: props.sessionDocumentId,
          },
        });
        
        transcriptSubmitStatus.value = {
          type: 'success',
          message: 'Transcript source added successfully!',
        };
        
        // Reset form for next entry
        transcriptForm.title = '';
        transcriptForm.transcription = '';
        
        emit('uploaded', 1);
      } catch (error: any) {
        console.error('Transcript submit error:', error);
        transcriptSubmitStatus.value = {
          type: 'error',
          message: error.response?.data?.error?.message || error.message || 'Failed to add transcript',
        };
      } finally {
        isSubmittingTranscript.value = false;
      }
    };
    
    // Text files methods
    const readTextFileContent = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string || '');
        };
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        reader.readAsText(file);
      });
    };
    
    const addTextFiles = async (files: FileList | File[]) => {
      const textFiles = Array.from(files).filter(
        file => file.type === 'text/plain' || file.name.endsWith('.txt')
      );
      
      for (const file of textFiles) {
        // Check if file already exists
        const exists = pendingTextFiles.value.some(
          pf => pf.file.name === file.name && pf.file.size === file.size
        );
        
        if (!exists) {
          try {
            const content = await readTextFileContent(file);
            pendingTextFiles.value.push({
              id: generateId(),
              file,
              title: extractFileName(file),
              source_type: textFilesSourceType.value,
              content,
              charCount: content.length,
              status: 'pending',
            });
          } catch (err) {
            console.error('Failed to read file:', file.name, err);
          }
        }
      }
    };
    
    const onTextFilesDragEnter = () => {
      textFilesDragCounter.value++;
      isTextFilesDragging.value = true;
    };
    
    const onTextFilesDragLeave = () => {
      textFilesDragCounter.value--;
      if (textFilesDragCounter.value === 0) {
        isTextFilesDragging.value = false;
      }
    };
    
    const onTextFilesDrop = async (e: DragEvent) => {
      isTextFilesDragging.value = false;
      textFilesDragCounter.value = 0;
      
      if (isSubmittingTextFiles.value) return;
      
      if (e.dataTransfer?.files) {
        await addTextFiles(e.dataTransfer.files);
      }
    };
    
    const triggerTextFileInput = () => {
      if (isSubmittingTextFiles.value) return;
      textFileInput.value?.click();
    };
    
    const onTextFileSelect = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        await addTextFiles(target.files);
        target.value = '';
      }
    };
    
    const removeTextFile = (index: number) => {
      pendingTextFiles.value.splice(index, 1);
    };
    
    const clearAllTextFiles = () => {
      pendingTextFiles.value = [];
    };
    
    const submitSingleTextFile = async (pendingFile: PendingTextFile): Promise<boolean> => {
      pendingFile.status = 'uploading';
      
      try {
        await httpService.post('/audio-sources', {
          data: {
            title: pendingFile.title,
            source_type: pendingFile.source_type,
            transcription: pendingFile.content,
            work_status: 'transcribed', // Mark as already transcribed
            session: props.sessionDocumentId,
          },
        });
        
        pendingFile.status = 'completed';
        return true;
      } catch (error: any) {
        console.error('Text file submit error:', error);
        pendingFile.status = 'error';
        pendingFile.error = error.response?.data?.error?.message || error.message || 'Failed to create source';
        return false;
      }
    };
    
    const submitAllTextFiles = async () => {
      const filesToSubmit = pendingTextFiles.value.filter(f => f.status === 'pending');
      if (filesToSubmit.length === 0) return;
      
      isSubmittingTextFiles.value = true;
      
      for (const file of filesToSubmit) {
        await submitSingleTextFile(file);
      }
      
      isSubmittingTextFiles.value = false;
      
      const successCount = pendingTextFiles.value.filter(f => f.status === 'completed').length;
      if (successCount > 0) {
        emit('uploaded', successCount);
      }
    };

    const handleClose = () => {
      if (isUploading.value || isSubmittingTranscript.value || isSubmittingTextFiles.value) return;
      
      // Reset audio upload state
      pendingFiles.value = [];
      isDragging.value = false;
      dragCounter.value = 0;
      
      // Reset text files state
      pendingTextFiles.value = [];
      isTextFilesDragging.value = false;
      textFilesDragCounter.value = 0;
      
      // Reset transcript form state
      transcriptForm.title = '';
      transcriptForm.source_type = 'dialogue';
      transcriptForm.transcription = '';
      transcriptSubmitStatus.value = null;
      inputMode.value = 'audio';
      
      emit('update:modelValue', false);
      emit('close');
    };

    // Reset state when dialog opens
    watch(() => props.modelValue, (newVal) => {
      if (newVal) {
        pendingFiles.value = [];
        pendingTextFiles.value = [];
        transcriptSubmitStatus.value = null;
      }
    });

    return {
      fileInput,
      isDragging,
      defaultSourceType,
      pendingFiles,
      isUploading,
      sourceTypeOptions,
      uploadSummary,
      hasCompletedUploads,
      allFilesProcessed,
      uploadButtonText,
      formatFileSize,
      onDragEnter,
      onDragLeave,
      onDrop,
      triggerFileInput,
      onFileSelect,
      removeFile,
      clearAllFiles,
      uploadAll,
      handleClose,
      // Transcript mode
      inputMode,
      transcriptForm,
      isSubmittingTranscript,
      transcriptSubmitStatus,
      submitTranscript,
      // Text files mode
      textFileInput,
      isTextFilesDragging,
      textFilesSourceType,
      pendingTextFiles,
      isSubmittingTextFiles,
      textFilesSummary,
      hasCompletedTextFiles,
      allTextFilesProcessed,
      textFilesButtonText,
      hasAnyCompletedUploads,
      onTextFilesDragEnter,
      onTextFilesDragLeave,
      onTextFilesDrop,
      triggerTextFileInput,
      onTextFileSelect,
      removeTextFile,
      clearAllTextFiles,
      submitAllTextFiles,
    };
  },
});
</script>

<style scoped>
.bulk-uploader-card {
  overflow: visible;
}

.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 12px;
  padding: 40px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafafa;
}

.drop-zone:hover:not(.disabled) {
  border-color: #1976d2;
  background: rgba(25, 118, 210, 0.05);
}

.drop-zone.dragging {
  border-color: #1976d2;
  background: rgba(25, 118, 210, 0.1);
  transform: scale(1.01);
}

.drop-zone.has-files {
  padding: 24px;
  border-style: solid;
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.05);
}

.drop-zone.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.drop-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 4px;
  color: #333;
}

.drop-hint {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.drop-formats {
  font-size: 12px;
  color: #999;
  margin: 12px 0 0;
}

/* File List */
.file-list {
  margin-top: 20px;
}

.file-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 500;
  color: #666;
}

.file-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.file-item.uploading {
  border-color: #1976d2;
  background: rgba(25, 118, 210, 0.05);
}

.file-item.completed {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.05);
}

.file-item.error {
  border-color: #f44336;
  background: rgba(244, 67, 54, 0.05);
}

.file-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-title-input {
  font-weight: 500;
}

.file-title-input :deep(.v-field__input) {
  padding: 0;
  min-height: unset;
  font-size: 14px;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.file-size {
  font-size: 12px;
  color: #999;
}

.file-type-select {
  max-width: 120px;
}

.file-type-select :deep(.v-field__input) {
  padding: 0;
  min-height: unset;
  font-size: 12px;
}

.file-error {
  font-size: 12px;
  color: #f44336;
  margin-top: 4px;
}

.file-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.progress-text {
  font-size: 12px;
  font-weight: 500;
  color: #1976d2;
  min-width: 36px;
  text-align: right;
}

/* Upload Summary */
.upload-summary {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 16px;
  font-size: 14px;
}

.upload-summary.success {
  background: rgba(76, 175, 80, 0.1);
  color: #2e7d32;
}

.upload-summary.error {
  background: rgba(244, 67, 54, 0.1);
  color: #c62828;
}
</style>

