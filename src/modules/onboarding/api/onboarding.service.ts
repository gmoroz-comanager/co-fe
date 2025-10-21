import { httpService } from '@/core/api';

export interface PersonaAnalysis {
  identity: {
    name?: string;
    role?: string;
    shortBio?: string;
    values?: string[];
    toneSuggestions?: string[];
    humorLevelGuess?: number;
  };
  audience: {
    primary?: string[];
    secondary?: string[];
  };
  signals: {
    strengths?: string[];
    risks?: string[];
    gaps?: string[];
  };
  content: {
    contentPillars?: string[];
    channelFit?: Array<{
      channel: string;
      why: string;
      confidence: string;
    }>;
    sampleHooks?: string[];
  };
  citations?: Array<{
    quote: string;
    pageOrSection?: string;
  }>;
}

export interface UploadPdfResponse {
  success: boolean;
  message: string;
  data: {
    analysis: PersonaAnalysis;
    fileId: number;
  };
}

export interface SkipStageResponse {
  success: boolean;
  message: string;
}

export interface Stage2MessageResponse {
  response: {
    role: string;
    content: string;
  };
  isComplete: boolean;
}

/**
 * Onboarding service for handling onboarding flows
 */
class OnboardingService {
  /**
   * Process user profile from already uploaded PDF (exhibition flow)
   */
  async processProfile(): Promise<UploadPdfResponse> {
    const response = await httpService.post<UploadPdfResponse>('/onboarding/process-profile');
    return response.data;
  }

  /**
   * Initializes the Stage 2 chat.
   */
  async initStage2Chat(): Promise<any[]> {
    const response = await httpService.get('/onboarding/stage2/init');
    return response.data;
  }

  /**
   * Posts a message to the Stage 2 chat.
   */
  async postStage2Message(message: string): Promise<Stage2MessageResponse> {
    const response = await httpService.post<Stage2MessageResponse>('/onboarding/stage2/message', { message });
    return response.data;
  }

  /**
   * Upload LinkedIn PDF for analysis (legacy - for future use)
   */
  async uploadLinkedInPdf(file: File): Promise<UploadPdfResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await httpService.post<UploadPdfResponse>(
      '/onboarding/linkedin-pdf',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * Skip onboarding stage 1
   */
  async skipStage1(): Promise<SkipStageResponse> {
    const response = await httpService.post<SkipStageResponse>('/onboarding/skip-stage1');
    return response.data;
  }
}

// Create singleton instance
const onboardingService = new OnboardingService();

export default onboardingService;

