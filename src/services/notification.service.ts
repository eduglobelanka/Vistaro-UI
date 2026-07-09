import apiClient from './api-client';
import type { ApiResponse } from '../types/api';
import type { NotificationResponseDto } from '../types/messaging';

export const notificationService = {
  async getNotifications(): Promise<ApiResponse<NotificationResponseDto[]>> {
    const response = await apiClient.get<ApiResponse<NotificationResponseDto[]>>('/api/notifications');
    return response.data;
  },

  async markRead(id: string): Promise<ApiResponse<NotificationResponseDto>> {
    const response = await apiClient.put<ApiResponse<NotificationResponseDto>>(`/api/notifications/${id}/read`);
    return response.data;
  },
};

export default notificationService;
