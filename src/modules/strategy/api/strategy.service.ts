import { httpService } from '@/core/api';

export interface ContentStrategyAttributes {
  name: string;
  personaType: string;
  targetAudience: string;
  languagesArray: string[];
  toneType: 'calm' | 'agressive';
  formality: 'casual' | 'professional' | 'humorous';
  sentenceLength: 'short' | 'medium' | 'long';
  lexiconPreferred: string;
  lexiconAvoid: string;
  humorAmount: number;
  coreValues: string;
  avoidTopics: string;
  useEmodji: boolean;
  useAudienceQuestions: boolean;
  useSlang: boolean;
  targetPostCount: number;
  callToActionFormatsArray: string;
  smmChannelsArray: string;
  userExamples: string;
  mainGoalsArray: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  post_idea?: {
    data: {
      id: number;
      attributes: any;
    } | null;
  };
}

export interface ContentStrategy {
  id: number;
  documentId: string;
  name: string;
  personaType: string;
  targetAudience: string;
  languagesArray: string[];
  toneType: 'calm' | 'agressive';
  formality: 'casual' | 'professional' | 'humorous';
  sentenceLength: 'short' | 'medium' | 'long';
  lexiconPreferred: string;
  lexiconAvoid: string;
  humorAmount: number;
  coreValues: string;
  avoidTopics: string;
  useEmodji: boolean;
  useAudienceQuestions: boolean;
  useSlang: boolean;
  targetPostCount: number;
  callToActionFormatsArray: string;
  smmChannelsArray: string;
  userExamples: string;
  mainGoalsArray: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  post_idea?: {
    data: {
      id: number;
      attributes: any;
    } | null;
  };
}

export interface ContentStrategiesResponse {
  data: ContentStrategy[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    }
  }
}

export interface ContentStrategyResponse {
  data: ContentStrategy;
}

export interface ContentStrategyFilters {
  personaType?: string;
  toneType?: string;
  formality?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
}

export interface StrategyCreationData {
  step1: {
    name: string;
    personaType: string;
    targetAudience: string;
    languagesArray: string[];
  };
  step2: {
    toneType: 'calm' | 'agressive';
    formality: 'casual' | 'professional' | 'humorous';
    sentenceLength: 'short' | 'medium' | 'long';
    humorAmount: number;
  };
  step3: {
    lexiconPreferred: string;
    lexiconAvoid: string;
    coreValues: string;
    avoidTopics: string;
  };
  step4: {
    useEmodji: boolean;
    useAudienceQuestions: boolean;
    useSlang: boolean;
    targetPostCount: number;
    callToActionFormatsArray: string;
    smmChannelsArray: string;
    userExamples: string;
    mainGoalsArray: string;
  };
}

/**
 * Content Strategy service for handling strategy-related API requests
 */
class ContentStrategyService {
  /**
   * Get all content strategies with optional filters
   */
  async getStrategies(filters: ContentStrategyFilters = {}): Promise<ContentStrategiesResponse> {
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
    if (filters.personaType) {
      queryParams.append('filters[personaType][$eq]', filters.personaType);
    }
    
    if (filters.toneType) {
      queryParams.append('filters[toneType][$eq]', filters.toneType);
    }
    
    if (filters.formality) {
      queryParams.append('filters[formality][$eq]', filters.formality);
    }
    
    if (filters.startDate) {
      queryParams.append('filters[createdAt][$gte]', filters.startDate);
    }
    
    if (filters.endDate) {
      queryParams.append('filters[createdAt][$lte]', filters.endDate);
    }
    
    if (filters.searchTerm) {
      queryParams.append('filters[$or][0][name][$containsi]', filters.searchTerm);
      queryParams.append('filters[$or][1][targetAudience][$containsi]', filters.searchTerm);
      queryParams.append('filters[$or][2][coreValues][$containsi]', filters.searchTerm);
    }
    
    const response = await httpService.get<ContentStrategiesResponse>(`/content-strategies?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get a single content strategy by ID
   */
  async getStrategy(id: string | number): Promise<ContentStrategyResponse> {
    const response = await httpService.get<ContentStrategyResponse>(`/content-strategies/${id}?populate=*`);
    return response.data;
  }

  /**
   * Create a new content strategy
   */
  async createStrategy(data: Partial<ContentStrategyAttributes>): Promise<ContentStrategyResponse> {
    const response = await httpService.post<ContentStrategyResponse>('/content-strategies', {
      data: data
    });
    return response.data;
  }

  /**
   * Update an existing content strategy
   */
  async updateStrategy(id: string | number, data: Partial<ContentStrategyAttributes>): Promise<ContentStrategyResponse> {
    const response = await httpService.put<ContentStrategyResponse>(`/content-strategies/${id}`, {
      data: data
    });
    return response.data;
  }

  /**
   * Delete a content strategy
   */
  async deleteStrategy(id: string | number): Promise<void> {
    await httpService.delete(`/content-strategies/${id}`);
  }

  /**
   * Publish a content strategy
   */
  async publishStrategy(id: string | number): Promise<ContentStrategyResponse> {
    const response = await httpService.post<ContentStrategyResponse>(`/content-strategies/${id}/actions/publish`);
    return response.data;
  }

  /**
   * Unpublish a content strategy
   */
  async unpublishStrategy(id: string | number): Promise<ContentStrategyResponse> {
    const response = await httpService.post<ContentStrategyResponse>(`/content-strategies/${id}/actions/unpublish`);
    return response.data;
  }

  /**
   * Count strategies by status
   */
  async countStrategies(): Promise<{ total: number; published: number; draft: number }> {
    const [totalResponse, publishedResponse] = await Promise.all([
      httpService.get<ContentStrategiesResponse>('/content-strategies?pagination[pageSize]=1'),
      httpService.get<ContentStrategiesResponse>('/content-strategies?filters[publishedAt][$notNull]=true&pagination[pageSize]=1')
    ]);
    
    return {
      total: totalResponse.data.meta.pagination.total,
      published: publishedResponse.data.meta.pagination.total,
      draft: totalResponse.data.meta.pagination.total - publishedResponse.data.meta.pagination.total
    };
  }
}

// Create singleton instance
export const contentStrategyService = new ContentStrategyService();

