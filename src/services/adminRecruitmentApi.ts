import apiClient from './api-client';
import type { ApiResponse } from '../types/api';
import type { AdminJobApplicationResponseDto, AdminApplicationReviewDto } from '../types/recruitment';
import type { AuditLogResponseDto } from '../types/admin';

export const adminRecruitmentApi = {
  async getPendingApplications(): Promise<ApiResponse<AdminJobApplicationResponseDto[]>> {
    const response = await apiClient.get<ApiResponse<AdminJobApplicationResponseDto[]>>('/api/admin/applications/pending');
    return response.data;
  },

  async approveApplicationForEmployer(
    id: string,
    data: AdminApplicationReviewDto
  ): Promise<ApiResponse<AdminJobApplicationResponseDto>> {
    const response = await apiClient.put<ApiResponse<AdminJobApplicationResponseDto>>(
      `/api/admin/applications/${id}/approve-for-employer`,
      data
    );
    return response.data;
  },

  async rejectApplication(
    id: string,
    data: AdminApplicationReviewDto
  ): Promise<ApiResponse<AdminJobApplicationResponseDto>> {
    const response = await apiClient.put<ApiResponse<AdminJobApplicationResponseDto>>(
      `/api/admin/applications/${id}/reject`,
      data
    );
    return response.data;
  },

  async requestMoreInformation(
    id: string,
    data: AdminApplicationReviewDto
  ): Promise<ApiResponse<AdminJobApplicationResponseDto>> {
    const response = await apiClient.put<ApiResponse<AdminJobApplicationResponseDto>>(
      `/api/admin/applications/${id}/request-more-information`,
      data
    );
    return response.data;
  },

  async getPendingInterviews(): Promise<ApiResponse<AdminJobApplicationResponseDto[]>> {
    const response = await apiClient.get<ApiResponse<AdminJobApplicationResponseDto[]>>('/api/admin/interviews/pending');
    return response.data;
  },

  async approveInterview(applicationId: string): Promise<ApiResponse<AdminJobApplicationResponseDto>> {
    const response = await apiClient.put<ApiResponse<AdminJobApplicationResponseDto>>(
      `/api/admin/interviews/${applicationId}/approve`
    );
    return response.data;
  },

  async getAuditLogs(count: number): Promise<ApiResponse<AuditLogResponseDto[]>> {
    const response = await apiClient.get<ApiResponse<AuditLogResponseDto[]>>(`/api/admin/audit-logs?count=${count}`);
    return response.data;
  },
};

export default adminRecruitmentApi;
