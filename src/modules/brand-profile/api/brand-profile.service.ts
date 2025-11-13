import httpService from '@/core/api/http';
import { BrandProfile } from './brand-profile.types';

class BrandProfileService {
  async getBrandProfile(): Promise<BrandProfile[]> {
    const response = await httpService.get<{ data: BrandProfile[] }>('/brand-profiles');
    return response.data.data;
  }

  async createBrandProfile(data: Partial<BrandProfile>): Promise<BrandProfile> {
    const response = await httpService.post<{ data: BrandProfile }>('/brand-profiles', { data });
    return response.data.data;
  }

  async updateBrandProfile(id: string, data: Partial<BrandProfile>): Promise<BrandProfile> {
    const response = await httpService.put<{ data: BrandProfile }>(`/brand-profiles/${id}`, { data });
    return response.data.data;
  }
}

export const brandProfileService = new BrandProfileService();

