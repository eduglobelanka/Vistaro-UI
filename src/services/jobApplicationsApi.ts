import apiClient from './api-client';
import type { ApiResponse } from '../types/api';
import type {
  JobApplicationResponseDto,
  ApplyJobApplicationDto,
  UpdateJobApplicationStatusDto,
} from '../types/jobs';
import type { ModeratedMessageResponseDto, RequestContactReleaseDto } from '../types/recruitment';

export const jobApplicationsApi = {
  async applyToJob(
    jobPostingId: string,
    data: ApplyJobApplicationDto
  ): Promise<ApiResponse<JobApplicationResponseDto>> {
    const response = await apiClient.post<ApiResponse<JobApplicationResponseDto>>(
      `/api/job-applications/${jobPostingId}/apply`,
      data
    );
    return response.data;
  },

  async getMyApplications(): Promise<ApiResponse<JobApplicationResponseDto[]>> {
    const response = await apiClient.get<ApiResponse<JobApplicationResponseDto[]>>('/api/job-applications/my');
    return response.data;
  },

  async getEmployerApplications(): Promise<ApiResponse<JobApplicationResponseDto[]>> {
    const response = await apiClient.get<ApiResponse<JobApplicationResponseDto[]>>('/api/job-applications/employer');
    return response.data;
  },

  async updateApplicationStatus(
    id: string,
    data: UpdateJobApplicationStatusDto
  ): Promise<ApiResponse<JobApplicationResponseDto>> {
    const response = await apiClient.put<ApiResponse<JobApplicationResponseDto>>(
      `/api/job-applications/${id}/status`,
      data
    );
    return response.data;
  },

  async requestInterview(id: string): Promise<ApiResponse<JobApplicationResponseDto>> {
    const response = await apiClient.put<ApiResponse<JobApplicationResponseDto>>(
      `/api/job-applications/${id}/request-interview`
    );
    return response.data;
  },

  async makeConditionalOffer(id: string): Promise<ApiResponse<JobApplicationResponseDto>> {
    const response = await apiClient.put<ApiResponse<JobApplicationResponseDto>>(
      `/api/job-applications/${id}/conditional-offer`
    );
    return response.data;
  },

  async sendModeratedMessage(data: {
    jobApplicationId: string;
    messageText: string;
  }): Promise<ApiResponse<ModeratedMessageResponseDto>> {
    const response = await apiClient.post<ApiResponse<ModeratedMessageResponseDto>>(
      '/api/job-applications/messages',
      data
    );
    return response.data;
  },

  async getApprovedMessages(): Promise<ApiResponse<ModeratedMessageResponseDto[]>> {
    const response = await apiClient.get<ApiResponse<ModeratedMessageResponseDto[]>>('/api/job-applications/messages');
    return response.data;
  },

  async requestContactRelease(
    id: string,
    data: RequestContactReleaseDto
  ): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(
      `/api/job-applications/${id}/contact-release/request`,
      data
    );
    return response.data;
  },

  async acceptInterview(id: string): Promise<ApiResponse<JobApplicationResponseDto>> {
    const response = await apiClient.put<ApiResponse<JobApplicationResponseDto>>(
      `/api/job-applications/${id}/interview/accept`
    );
    return response.data;
  },

  async declineInterview(id: string): Promise<ApiResponse<JobApplicationResponseDto>> {
    const response = await apiClient.put<ApiResponse<JobApplicationResponseDto>>(
      `/api/job-applications/${id}/interview/decline`
    );
    return response.data;
  },

  async acceptOffer(id: string): Promise<ApiResponse<JobApplicationResponseDto>> {
    const response = await apiClient.put<ApiResponse<JobApplicationResponseDto>>(
      `/api/job-applications/${id}/offer/accept`
    );
    return response.data;
  },

  async declineOffer(id: string): Promise<ApiResponse<JobApplicationResponseDto>> {
    const response = await apiClient.put<ApiResponse<JobApplicationResponseDto>>(
      `/api/job-applications/${id}/offer/decline`
    );
    return response.data;
  },

  async withdrawApplication(id: string): Promise<ApiResponse<JobApplicationResponseDto>> {
    const response = await apiClient.put<ApiResponse<JobApplicationResponseDto>>(
      `/api/job-applications/${id}/withdraw`
    );
    return response.data;
  },
};

export default jobApplicationsApi;
