import apiClient from './api-client';
import type { ApiResponse } from '../types/api';
import type { JobSearchRequestDto, JobSearchResponseDto } from '../types/jobs';

export const jobSearchService = {
  async searchJobs(filters: JobSearchRequestDto): Promise<ApiResponse<JobSearchResponseDto>> {
    const response = await apiClient.get<ApiResponse<JobSearchResponseDto>>('/api/jobs/search', {
      params: filters,
    });
    return response.data;
  },
};

export default jobSearchService;
