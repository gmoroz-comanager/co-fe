import { httpService } from '@/core/api';

export interface Contact {
  id: number;
  documentId: string;
  name: string;
  email?: string;
  externalId?: string;
  telegramHandle?: string;
  jobTitle?: string;
  contactDescription?: any[]; // Strapi blocks
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface ContactListResponse {
  data: Contact[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface ContactResponse {
  data: Contact;
}

class ContactsService {
  async getContacts(params: any = {}): Promise<ContactListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('pagination[page]', params.page.toString());
    if (params.pageSize) queryParams.append('pagination[pageSize]', params.pageSize.toString());
    queryParams.append('sort', params.sort || 'createdAt:desc');

    const response = await httpService.get<ContactListResponse>(`/contacts?${queryParams.toString()}`);
    return response.data;
  }

  async getContact(id: string): Promise<ContactResponse> {
    const response = await httpService.get<ContactResponse>(`/contacts/${id}`);
    return response.data;
  }

  async createContact(data: Partial<Contact>): Promise<ContactResponse> {
    const response = await httpService.post<ContactResponse>('/contacts', { data });
    return response.data;
  }

  async updateContact(id: string, data: Partial<Contact>): Promise<ContactResponse> {
    const response = await httpService.put<ContactResponse>(`/contacts/${id}`, { data });
    return response.data;
  }

  async deleteContact(id: string): Promise<void> {
    await httpService.delete(`/contacts/${id}`);
  }
}

export const contactsService = new ContactsService();

