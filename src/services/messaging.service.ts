import apiClient from './api-client';
import type { ApiResponse } from '../types/api';
import type {
  MessageResponseDto,
  SendMessageDto,
  SendJobInvitationDto,
  JobInvitationResponseDto,
  InvitationStatus,
} from '../types/messaging';

export const messagingService = {
  async getInbox(): Promise<ApiResponse<MessageResponseDto[]>> {
    const response = await apiClient.get<ApiResponse<MessageResponseDto[]>>('/api/messages/inbox');
    return response.data;
  },

  async getConversation(userId: string): Promise<ApiResponse<MessageResponseDto[]>> {
    const response = await apiClient.get<ApiResponse<MessageResponseDto[]>>(`/api/messages/conversation/by-user/${userId}`);
    return response.data;
  },

  async getConversationById(conversationId: string): Promise<ApiResponse<MessageResponseDto[]>> {
    const response = await apiClient.get<ApiResponse<MessageResponseDto[]>>(`/api/messages/conversation/${conversationId}`);
    return response.data;
  },

  async sendMessage(data: SendMessageDto): Promise<ApiResponse<MessageResponseDto>> {
    const response = await apiClient.post<ApiResponse<MessageResponseDto>>('/api/messages/send', data);
    return response.data;
  },

  async markRead(messageId: string): Promise<ApiResponse<MessageResponseDto>> {
    const response = await apiClient.put<ApiResponse<MessageResponseDto>>(`/api/messages/read/${messageId}`);
    return response.data;
  },

  async sendJobInvitation(data: SendJobInvitationDto): Promise<ApiResponse<JobInvitationResponseDto>> {
    const response = await apiClient.post<ApiResponse<JobInvitationResponseDto>>('/api/job-invitations/send', data);
    return response.data;
  },

  async acceptInvitation(id: string): Promise<ApiResponse<JobInvitationResponseDto>> {
    const response = await apiClient.put<ApiResponse<JobInvitationResponseDto>>(`/api/job-invitations/${id}/accept`);
    return response.data;
  },

  async declineInvitation(id: string): Promise<ApiResponse<JobInvitationResponseDto>> {
    const response = await apiClient.put<ApiResponse<JobInvitationResponseDto>>(`/api/job-invitations/${id}/decline`);
    return response.data;
  },

  async updateInvitationStatus(messageId: string, status: InvitationStatus): Promise<ApiResponse<MessageResponseDto>> {
    const response = await apiClient.put<ApiResponse<MessageResponseDto>>(`/api/messages/${messageId}/invitation-status`, { invitationStatus: status });
    return response.data;
  },
};

export default messagingService;
