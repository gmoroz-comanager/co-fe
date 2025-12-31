import httpService from '@/core/api/http';

// Interfaces
export interface Narrative {
  title: string;
  percent: number;
  description?: string;
}

export interface AudioSource {
  id: number;
  documentId: string;
  title: string;
  transcription?: string;
  summary?: string;

  source_type?: 'chat' | 'dialogue' | 'lecture';
  work_status?: string;
  audio_file?: any[];
  transcript_structure?: any[];
  speakers?: Record<string, any>;
  session?: {
    id: number;
    documentId: string;
    title: string;
  };
  createdAt?: string;
}

export interface Idea {
  id: number;
  documentId: string;
  title: string;
  body?: string;
  question?: string;
  work_status?: string;
  recommendedChannel?: string;
  createdAt?: string;
}

export interface Contact {
  id: number;
  documentId: string;
  name: string;
  email?: string;
}

export interface Session {
  id: number;
  documentId: string;
  title: string;
  date_start?: string;
  date_end?: string;
  summary?: string;
  narratives?: Narrative[];
  work_status: 'draft' | 'processing' | 'ready' | 'error';
  audio_sources?: AudioSource[];
  ideas?: Idea[];
  participants?: Contact[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SessionsResponse {
  data: Session[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface SessionResponse {
  data: Session;
}

export interface ProcessingStatus {
  sessionId: string;
  sessionStatus: string;
  totalSources: number;
  statusCounts: {
    created: number;
    transcribing: number;
    transcribed: number;
    summarizing: number;
    summarized: number;
    processed: number;
    failed: number;
  };
  hasSummary: boolean;
  hasNarratives: boolean;
  recentJobs: Array<{
    id: string;
    type: string;
    status: string;
    targetType: string;
    targetId: string;
    error?: string;
    createdAt: string;
  }>;
}

export interface SessionFilters {
  search?: string;
  dateStart?: string;
  dateEnd?: string;
  status?: string;
  participantId?: string;
  hasIdeas?: boolean;
  hasPosts?: boolean;
  sourceTypes?: string[];
  sortBy?: 'createdAt' | 'date_start';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateSessionData {
  title: string;
  date_start?: string;
  participants?: string[];
}

export interface UpdateSessionData {
  title?: string;
  date_start?: string;
  date_end?: string;
  participants?: string[];
}

/**
 * Sessions service for handling session-related API requests
 */
class SessionsService {
  /**
   * Get all sessions with optional filters
   */
  async getSessions(filters?: SessionFilters): Promise<SessionsResponse> {
    try {
      const sortField = filters?.sortBy || 'createdAt';
      const sortOrder = filters?.sortOrder || 'desc';
      let queryParams = `populate[audio_sources][populate]=audio_file&populate[ideas]=true&populate[participants]=true&sort=${sortField}:${sortOrder}`;

      if (filters?.status) {
        queryParams += `&filters[work_status][$eq]=${filters.status}`;
      }

      // Filter by session's date_start field within the selected date range
      if (filters?.dateStart) {
        queryParams += `&filters[date_start][$gte]=${filters.dateStart}`;
      }

      if (filters?.dateEnd) {
        queryParams += `&filters[date_start][$lte]=${filters.dateEnd}`;
      }

      if (filters?.search) {
        queryParams += `&filters[$or][0][title][$containsi]=${encodeURIComponent(filters.search)}`;
        queryParams += `&filters[$or][1][summary][$containsi]=${encodeURIComponent(filters.search)}`;
      }

      // Filter by participant (contact) - using Strapi v5 relation filtering
      if (filters?.participantId) {
        queryParams += `&filters[participants][documentId][$eq]=${filters.participantId}`;
      }

      console.log('[SessionsService] getSessions query:', queryParams);
      console.log('[SessionsService] filters:', filters);

      const response = await httpService.get<SessionsResponse>(`/sessions?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  }

  /**
   * Get a single session by ID with full details
   */
  async getSession(documentId: string): Promise<SessionResponse> {
    try {
      // Use object notation - use 'true' instead of '*' to avoid deep populate errors
      const queryParams = 'populate[audio_sources][populate]=audio_file&populate[ideas]=true&populate[participants]=true';
      const response = await httpService.get<SessionResponse>(`/sessions/${documentId}?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching session:', error);
      throw error;
    }
  }

  /**
   * Create a new session
   */
  async createSession(data: CreateSessionData): Promise<SessionResponse> {
    try {
      const response = await httpService.post<SessionResponse>('/sessions', {
        data: {
          ...data,
          work_status: 'draft',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  /**
   * Update a session
   */
  async updateSession(documentId: string, data: UpdateSessionData): Promise<SessionResponse> {
    try {
      const response = await httpService.put<SessionResponse>(`/sessions/${documentId}`, {
        data,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(documentId: string): Promise<void> {
    try {
      await httpService.delete(`/sessions/${documentId}`);
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  /**
   * Start processing a session (transcribe -> summarize -> session summary)
   */
  async processSession(documentId: string): Promise<{ message: string; jobsCreated: string[] }> {
    try {
      const response = await httpService.post<{ message: string; jobsCreated: string[] }>(
        `/sessions/${documentId}/process`,
        {}
      );
      return response.data;
    } catch (error) {
      console.error('Error processing session:', error);
      throw error;
    }
  }

  /**
   * Generate ideas from selected audio sources
   */
  async generateIdeas(documentId: string, audioSourceIds: string[]): Promise<{ message: string }> {
    try {
      const response = await httpService.post<{ message: string }>(
        `/sessions/${documentId}/generate-ideas`,
        { audioSourceIds }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating ideas:', error);
      throw error;
    }
  }

  /**
   * Get processing status for a session
   */
  async getProcessingStatus(documentId: string): Promise<ProcessingStatus> {
    try {
      const response = await httpService.get<ProcessingStatus>(
        `/sessions/${documentId}/processing-status`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting processing status:', error);
      throw error;
    }
  }

  /**
   * Add audio source to session
   */
  async addAudioSource(sessionDocumentId: string, audioSourceData: {
    title: string;
    source_type?: string;
    audio_file?: number[];
  }): Promise<any> {
    try {
      const response = await httpService.post('/audio-sources', {
        data: {
          ...audioSourceData,
          session: sessionDocumentId,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error adding audio source:', error);
      throw error;
    }
  }

  /**
   * Move audio source to another session
   */
  async moveAudioSource(audioSourceDocumentId: string, toSessionDocumentId: string): Promise<void> {
    try {
      await httpService.put(`/audio-sources/${audioSourceDocumentId}`, {
        data: {
          session: toSessionDocumentId,
        },
      });
    } catch (error) {
      console.error('Error moving audio source:', error);
      throw error;
    }
  }

  /**
   * Detach audio source from session
   */
  async detachAudioSource(audioSourceDocumentId: string): Promise<void> {
    try {
      await httpService.put(`/audio-sources/${audioSourceDocumentId}`, {
        data: {
          session: null,
        },
      });
    } catch (error) {
      console.error('Error detaching audio source:', error);
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
      const response = await httpService.upload('/upload', formData, { onUploadProgress });
      return response.data;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  }

  /**
   * Get a single audio source by documentId
   */
  async getAudioSource(documentId: string): Promise<{ data: AudioSource }> {
    try {
      const queryParams = 'populate=audio_file&populate=session';
      const response = await httpService.get<{ data: AudioSource }>(
        `/audio-sources/${documentId}?${queryParams}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching audio source:', error);
      throw error;
    }
  }

  /**
   * Update an audio source
   */
  async updateAudioSource(documentId: string, data: Partial<AudioSource>): Promise<{ data: AudioSource }> {
    try {
      const response = await httpService.put<{ data: AudioSource }>(
        `/audio-sources/${documentId}`,
        { data }
      );
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
}

export const sessionsService = new SessionsService();

