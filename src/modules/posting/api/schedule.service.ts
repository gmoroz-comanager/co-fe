import httpService from '../../../core/api/http';

export interface ScheduledPost {
  id: number;
  documentId: string;
  scheduledAt: string;
  idea: any; // Replace with strict Idea type if available circular dependency
  channel: any;
  status: 'scheduled' | 'published' | 'failed';
}

export class ScheduleService {
  async getScheduledPosts(start: string, end: string): Promise<{ data: ScheduledPost[] }> {
    // Strapi filters for date range
    const query = new URLSearchParams({
        'filters[scheduledAt][$gte]': start,
        'filters[scheduledAt][$lte]': end,
        'populate': '*' 
    });
    const response = await httpService.get<{ data: ScheduledPost[] }>(`/scheduled-posts?${query.toString()}`);
    return response.data;
  }

  async createScheduledPost(data: Partial<ScheduledPost>): Promise<{ data: ScheduledPost }> {
    const response = await httpService.post<{ data: ScheduledPost }>('/scheduled-posts', { data });
    return response.data;
  }

  async updateScheduledPost(documentId: string, data: Partial<ScheduledPost>): Promise<{ data: ScheduledPost }> {
      const response = await httpService.put<{ data: ScheduledPost }>(`/scheduled-posts/${documentId}`, { data });
      return response.data;
  }
  
  async deleteScheduledPost(documentId: string): Promise<void> {
      await httpService.delete(`/scheduled-posts/${documentId}`);
  }
}

export const scheduleService = new ScheduleService();

