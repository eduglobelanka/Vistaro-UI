import apiClient from './api-client';
import type { ApiResponse } from '../types/api';
import type {
  JobApplicationResponseDto,
  ApplyJobApplicationDto,
  UpdateJobApplicationStatusDto,
} from '../types/jobs';

export const jobApplicationService = {
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

  async withdrawApplication(id: string): Promise<ApiResponse<JobApplicationResponseDto>> {
    const response = await apiClient.put<ApiResponse<JobApplicationResponseDto>>(`/api/job-applications/${id}/withdraw`);
    return response.data;
  },
};

export default jobApplicationService;
