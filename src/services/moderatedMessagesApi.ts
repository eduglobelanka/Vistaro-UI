import apiClient from './api-client';
import type { ApiResponse } from '../types/api';
import type {
  ModeratedMessageResponseDto,
  SendModeratedMessageDto,
  AdminModeratedMessageReviewDto,
} from '../types/recruitment';
import type { AdminMessageResponseDto } from '../types/admin';

export const moderatedMessagesApi = {
  async sendModeratedMessage(data: SendModeratedMessageDto): Promise<ApiResponse<ModeratedMessageResponseDto>> {
    const response = await apiClient.post<ApiResponse<ModeratedMessageResponseDto>>('/api/job-applications/messages', data);
    return response.data;
  },

  async getApprovedMessages(): Promise<ApiResponse<ModeratedMessageResponseDto[]>> {
    const response = await apiClient.get<ApiResponse<ModeratedMessageResponseDto[]>>('/api/job-applications/messages');
    return response.data;
  },

  async getPendingMessages(): Promise<ApiResponse<AdminMessageResponseDto[]>> {
    const response = await apiClient.get<ApiResponse<AdminMessageResponseDto[]>>('/api/admin/messages/pending');
    return response.data;
  },

  async approveMessage(id: string): Promise<ApiResponse<ModeratedMessageResponseDto>> {
    const response = await apiClient.put<ApiResponse<ModeratedMessageResponseDto>>(`/api/admin/messages/${id}/approve`);
    return response.data;
  },

  async rejectMessage(
    id: string,
    data: AdminModeratedMessageReviewDto
  ): Promise<ApiResponse<ModeratedMessageResponseDto>> {
    const response = await apiClient.put<ApiResponse<ModeratedMessageResponseDto>>(
      `/api/admin/messages/${id}/reject`,
      data
    );
    return response.data;
  },
};

export default moderatedMessagesApi;
