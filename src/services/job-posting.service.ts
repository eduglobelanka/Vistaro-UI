import apiClient from './api-client';
import type { ApiResponse } from '../types/api';
import type { JobPostingResponseDto, SaveJobPostingDto } from '../types/jobs';

export const jobPostingService = {
  async createJob(data: SaveJobPostingDto): Promise<ApiResponse<JobPostingResponseDto>> {
    const response = await apiClient.post<ApiResponse<JobPostingResponseDto>>('/api/job-postings', data);
    return response.data;
  },

  async getMyJobs(): Promise<ApiResponse<JobPostingResponseDto[]>> {
    const response = await apiClient.get<ApiResponse<JobPostingResponseDto[]>>('/api/job-postings/my');
    return response.data;
  },

  async getJobById(id: string): Promise<ApiResponse<JobPostingResponseDto>> {
    const response = await apiClient.get<ApiResponse<JobPostingResponseDto>>(`/api/job-postings/${id}`);
    return response.data;
  },

  async updateJob(id: string, data: SaveJobPostingDto): Promise<ApiResponse<JobPostingResponseDto>> {
    const response = await apiClient.put<ApiResponse<JobPostingResponseDto>>(`/api/job-postings/${id}`, data);
    return response.data;
  },

  async deleteJob(id: string): Promise<ApiResponse<object>> {
    const response = await apiClient.delete<ApiResponse<object>>(`/api/job-postings/${id}`);
    return response.data;
  },
};

export default jobPostingService;
