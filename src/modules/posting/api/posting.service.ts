import  httpService  from '../../../core/api/http';

export interface TelegramBot {
  id: number;
  documentId: string;
  username: string;
  first_name: string;
  channels?: TelegramChannel[];
}

export interface TelegramChannel {
  id: number;
  documentId: string;
  title: string;
  username?: string;
  bot?: TelegramBot;
  calendarColor?: string;
}

class PostingService {
  async registerBot(token: string): Promise<{ data: TelegramBot }> {
    const response = await httpService.post<{ data: TelegramBot }>('/telegram-bot/register', { token });
    return response.data;
  }

  async getBots(): Promise<{ data: TelegramBot[] }> {
    const response = await httpService.get<{ data: TelegramBot[] }>('/telegram-bots?populate=channels');
    return response.data;
  }

  async startVerification(botDocumentId: string): Promise<{ code: string; expiresAt: number }> {
    const response = await httpService.post<{ code: string; expiresAt: number }>('/telegram-channel/verify-start', { 
      botDocumentId 
    });
    return response.data;
  }

  async checkVerificationStatus(code: string): Promise<{ status: string }> {
    const response = await httpService.get<{ status: string }>('/telegram-channel/verify-status', { 
      params: { code } 
    });
    return response.data;
  }

  async getChannels(): Promise<{ data: TelegramChannel[] }> {
    const response = await httpService.get<{ data: TelegramChannel[] }>('/telegram-channels?populate=bot');
    return response.data;
  }

  async publishIdea(ideaDocumentId: string, channelDocumentId: string): Promise<{ status: string; url?: string }> {
    const response = await httpService.post<{ data: { status: string; url?: string } }>('/telegram-channel/publish', {
      ideaDocumentId,
      channelDocumentId
    });
    return response.data.data;
  }

  async updateChannelColor(documentId: string, calendarColor: string): Promise<{ data: TelegramChannel }> {
    const response = await httpService.put<{ data: TelegramChannel }>(`/telegram-channels/${documentId}`, {
      data: { calendarColor }
    });
    return response.data;
  }
}

export const postingService = new PostingService();

