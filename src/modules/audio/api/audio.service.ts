import httpService from '@/core/api/http';

export interface AudioFile {
  id: number;
  name: string;
  url: string;
  mime: string;
  size: number;
}

export interface AudioSource {
  id: number;
  documentId: string;
  title: string;
  transcription?: string;
  ideas?: string;
  external_audio_url?: string;
  external_transcription_id?: string;
  work_status?: string;
  audio_file?: AudioFile[] | { data: AudioFile[] };
  transcript_structure?: Array<{
    speaker: string;
    start: number;
    end: number;
    words: string[];
  }>;
  speakers?: Record<string, any>;
}

export interface AudioSourcesResponse {
  data: AudioSource[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    }
  }
}

export interface AudioSourceResponse {
  data: AudioSource;
}

export interface CreateAudioSourceData {
  title: string;
  transcription?: string;
  ideas?: string;
  audio_file?: number[];
}

/**
 * Audio service for handling audio-related API requests
 */
class AudioService {
  /**
   * Get all audio sources
   */
  async getAudioSources(): Promise<AudioSourcesResponse> {
    try {
      // Sort by createdAt in descending order (newest first)
      const response = await httpService.get<AudioSourcesResponse>('/audio-sources?populate=*&sort=createdAt:desc');
      return response.data;
    } catch (error) {
      console.error('Error fetching audio sources:', error);
      throw error;
    }
  }

  /**
   * Get a single audio source by ID
   */
  async getAudioSource(id: string | number): Promise<AudioSourceResponse> {
    try {
      const response = await httpService.get<AudioSourceResponse>(`/audio-sources/${id}?populate=*`);
      return response.data;
    } catch (error) {
      console.error('Error fetching audio source:', error);
      throw error;
    }
  }

  /**
   * Create a new audio source
   */
  async createAudioSource(data: CreateAudioSourceData): Promise<AudioSourceResponse> {
    try {
      const response = await httpService.post<AudioSourceResponse>('/audio-sources', {
        data: data
      });
      return response.data;
    } catch (error) {
      console.error('Error creating audio source:', error);
      throw error;
    }
  }

  /**
   * Update an audio source
   */
  async updateAudioSource(documentId: string, data: Partial<AudioSource>): Promise<AudioSourceResponse> {
    try {
      const response = await httpService.put<AudioSourceResponse>(`/audio-sources/${documentId}`, {
        data: data
      });
      return response.data;
    } catch (error) {
      console.error('Error updating audio source:', error);
      throw error;
    }
  }

  /**
   * Delete an audio source
   */
  async deleteAudioSource(documentId: string): Promise<void> {
    try {
      await httpService.delete(`/audio-sources/${documentId}`);
    } catch (error) {
      console.error('Error deleting audio source:', error);
      throw error;
    }
  }

  /**
   * Transcribe an audio source
   */
  async transcribeAudioSource(documentId: string): Promise<any> {
    try {
      const response = await httpService.post(`/audio-sources/${documentId}/transcribe`, {});
      return response.data;
    } catch (error) {
      console.error('Error transcribing audio source:', error);
      throw error;
    }
  }

  /**
   * Upload files to the media library
   */
  async uploadFiles(files: File[], onUploadProgress?: (progressEvent: any) => void): Promise<any[]> {
    try {
      const formData = new FormData();
      
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
      
      const response = await httpService.upload('/upload', formData, {
        onUploadProgress
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const audioService = new AudioService();
