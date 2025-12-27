import { httpService } from '@/core/api';

// Strapi v5 returns data directly without attributes wrapper
export interface Idea {
  id: number;
  documentId: string;
  title: string;
  question?: string;
  body?: any;
  polishedBody?: any;
  tags?: string;
  work_status?: 'new' | 'readyToPublish' | 'planned' | 'published';
  createdAt: string;
  updatedAt: string;
  
  // Extended fields
  brandFacet?: string;
  recommendedChannel?: string;
  alternativeTitles?: string[];
  draftText?: string;
  visualDescription?: string;
  announcementText?: string;
  
  // Relations (Strapi v5 format)
  postMedia?: {
    id: number;
    name: string;
    url: string;
    mime: string;
    size: number;
  } | null;
  audio_source?: {
    id: number;
    documentId: string;
    [key: string]: any;
  } | null;
  content_strategy?: {
    id: number;
    documentId: string;
    name?: string;
    [key: string]: any;
  } | null;
}

export interface IdeasResponse {
  data: Idea[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    }
  }
}

export interface IdeaResponse {
  data: Idea;
}

export interface IdeaFilters {
  audioSourceId?: number;
  workStatus?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
}

/**
 * Ideas service for handling idea-related API requests
 */
class IdeasService {
  /**
   * Get all ideas with optional filters
   */
  async getIdeas(filters: IdeaFilters = {}): Promise<IdeasResponse> {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    // Always populate related entities
    queryParams.append('populate', '*');
    
    // Add pagination
    if (filters.page) {
      queryParams.append('pagination[page]', filters.page.toString());
    }
    
    if (filters.pageSize) {
      queryParams.append('pagination[pageSize]', filters.pageSize.toString());
    }
    
    // Add sorting
    if (filters.sort) {
      queryParams.append('sort', filters.sort);
    } else {
      queryParams.append('sort', 'createdAt:desc');
    }
    
    // Add filters
    if (filters.workStatus) {
      queryParams.append('filters[work_status][$eq]', filters.workStatus);
    }
    
    if (filters.audioSourceId) {
      queryParams.append('filters[audio_source][id][$eq]', filters.audioSourceId.toString());
    }
    
    if (filters.startDate) {
      queryParams.append('filters[createdAt][$gte]', filters.startDate);
    }
    
    if (filters.endDate) {
      queryParams.append('filters[createdAt][$lte]', filters.endDate);
    }
    
    if (filters.searchTerm) {
      queryParams.append('filters[$or][0][title][$containsi]', filters.searchTerm);
      queryParams.append('filters[$or][1][question][$containsi]', filters.searchTerm);
      queryParams.append('filters[$or][2][tags][$containsi]', filters.searchTerm);
    }
    
    const response = await httpService.get<IdeasResponse>(`/ideas?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get a single idea by ID
   */
  async getIdea(id: string | number): Promise<IdeaResponse> {
    const response = await httpService.get<IdeaResponse>(`/ideas/${id}?populate=*`);
    return response.data;
  }

  /**
   * Create a new idea
   */
  async createIdea(data: Partial<Idea>): Promise<IdeaResponse> {
    const response = await httpService.post<IdeaResponse>('/ideas', {
      data: data
    });
    return response.data;
  }

  /**
   * Update an existing idea
   */
  async updateIdea(id: string | number, data: Partial<Idea>): Promise<IdeaResponse> {
    const response = await httpService.put<IdeaResponse>(`/ideas/${id}`, {
      data: data
    });
    return response.data;
  }

  /**
   * Delete an idea
   */
  async deleteIdea(id: string | number): Promise<void> {
    await httpService.delete(`/ideas/${id}`);
  }

  /**
   * Count ideas by status
   */
  async countIdeas(): Promise<{ total: number; new: number }> {
    const [totalResponse, newResponse] = await Promise.all([
      httpService.get<IdeasResponse>('/ideas?pagination[pageSize]=1'),
      httpService.get<IdeasResponse>('/ideas?filters[work_status][$eq]=new&pagination[pageSize]=1')
    ]);
    
    return {
      total: totalResponse.data.meta.pagination.total,
      new: newResponse.data.meta.pagination.total
    };
  }

  /**
   * Like an idea
   */
  async likeIdea(id: string | number): Promise<{ ok: boolean }> {
    const response = await httpService.post<{ ok: boolean }>(`/ideas/${id}/like`);
    return response.data;
  }

  /**
   * Dislike an idea
   */
  async dislikeIdea(id: string | number): Promise<{ ok: boolean }> {
    const response = await httpService.post<{ ok: boolean }>(`/ideas/${id}/dislike`);
    return response.data;
  }

  /**
   * Polish an idea (expand it using AI with transcription memory)
   */
  async polishIdea(id: string | number, feedback: string): Promise<IdeaResponse> {
    const response = await httpService.post<IdeaResponse>(`/ideas/${id}/polish`, {
      feedback,
    });
    return response.data;
  }
}

// Create singleton instance
export const ideasService = new IdeasService();


