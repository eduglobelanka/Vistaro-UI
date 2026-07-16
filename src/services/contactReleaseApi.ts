import apiClient from './api-client';
import type { ApiResponse } from '../types/api';
import type {
  RequestContactReleaseDto,
  ContactReleaseResponseDto,
  AdminContactReleaseDto,
  AdminApplicationReviewDto,
} from '../types/recruitment';

export const contactReleaseApi = {
  async requestContactRelease(
    jobApplicationId: string,
    data: RequestContactReleaseDto
  ): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(
      `/api/job-applications/${jobApplicationId}/contact-release/request`,
      data
    );
    return response.data;
  },

  async approveContactRelease(
    jobApplicationId: string,
    data: AdminContactReleaseDto
  ): Promise<ApiResponse<ContactReleaseResponseDto>> {
    const response = await apiClient.post<ApiResponse<ContactReleaseResponseDto>>(
      `/api/admin/contact-releases/${jobApplicationId}/approve`,
      data
    );
    return response.data;
  },

  async denyContactRelease(
    jobApplicationId: string,
    data: AdminApplicationReviewDto
  ): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(
      `/api/admin/contact-releases/${jobApplicationId}/deny`,
      data
    );
    return response.data;
  },
};

export default contactReleaseApi;
