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

