import apiClient from './api-client';
import type { ApiResponse } from '../types/api';
import type {
  ShopOwnerProfileResponseDto,
  SaveShopOwnerProfileDto,
  BusinessDocumentResponseDto,
} from '../types/shop-owner';
import type {
  AvailableStudentSearchRequestDto,
  AvailableStudentSearchResponseDto,
} from '../types/student';

export const shopOwnerService = {
  async getProfile(): Promise<ApiResponse<ShopOwnerProfileResponseDto>> {
    const response = await apiClient.get<ApiResponse<ShopOwnerProfileResponseDto>>('/api/shop-owner/profile');
    return response.data;
  },

  async createProfile(data: SaveShopOwnerProfileDto): Promise<ApiResponse<ShopOwnerProfileResponseDto>> {
    const response = await apiClient.post<ApiResponse<ShopOwnerProfileResponseDto>>('/api/shop-owner/profile', data);
    return response.data;
  },

  async updateProfile(data: SaveShopOwnerProfileDto): Promise<ApiResponse<ShopOwnerProfileResponseDto>> {
    const response = await apiClient.put<ApiResponse<ShopOwnerProfileResponseDto>>('/api/shop-owner/profile', data);
    return response.data;
  },

  async deleteProfile(): Promise<ApiResponse<object>> {
    const response = await apiClient.delete<ApiResponse<object>>('/api/shop-owner/profile');
    return response.data;
  },

  async getDocuments(): Promise<ApiResponse<BusinessDocumentResponseDto[]>> {
    const response = await apiClient.get<ApiResponse<BusinessDocumentResponseDto[]>>('/api/shop-owner/business-documents');
    return response.data;
  },

  async uploadDocument(file: File): Promise<ApiResponse<BusinessDocumentResponseDto>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<BusinessDocumentResponseDto>>(
      '/api/shop-owner/business-documents',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async deleteDocument(id: string): Promise<ApiResponse<object>> {
    const response = await apiClient.delete<ApiResponse<object>>(`/api/shop-owner/business-documents/${id}`);
    return response.data;
  },

  async searchStudents(query: AvailableStudentSearchRequestDto): Promise<ApiResponse<AvailableStudentSearchResponseDto>> {
    const params = new URLSearchParams();
    if (query.city) params.append('city', query.city);
    if (query.postcode) params.append('postcode', query.postcode);
    if (query.preferredJobCategory) params.append('preferredJobCategory', query.preferredJobCategory);
    if (query.employmentPreference !== undefined && query.employmentPreference !== null) {
      params.append('employmentPreference', query.employmentPreference.toString());
    }
    if (query.maxHoursPerWeek !== undefined && query.maxHoursPerWeek !== null) {
      params.append('maxHoursPerWeek', query.maxHoursPerWeek.toString());
    }
    if (query.preferredSearchRadius !== undefined && query.preferredSearchRadius !== null) {
      params.append('preferredSearchRadius', query.preferredSearchRadius.toString());
    }
    if (query.visaType !== undefined && query.visaType !== null) {
      params.append('visaType', query.visaType.toString());
    }
    params.append('pageNumber', query.pageNumber.toString());
    params.append('pageSize', query.pageSize.toString());
    params.append('sortBy', query.sortBy);

    const response = await apiClient.get<ApiResponse<AvailableStudentSearchResponseDto>>(`/api/employer/students/search?${params.toString()}`);
    return response.data;
  },
};

export default shopOwnerService;
