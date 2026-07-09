import apiClient from './api-client';
import type { ApiResponse } from '../types/api';
import type { StudentProfileResponseDto, SaveStudentProfileDto } from '../types/student';

export const studentService = {
  async getProfile(): Promise<ApiResponse<StudentProfileResponseDto>> {
    const response = await apiClient.get<ApiResponse<StudentProfileResponseDto>>('/api/student/profile');
    return response.data;
  },

  async createProfile(data: SaveStudentProfileDto): Promise<ApiResponse<StudentProfileResponseDto>> {
    const response = await apiClient.post<ApiResponse<StudentProfileResponseDto>>('/api/student/profile', data);
    return response.data;
  },

  async updateProfile(data: SaveStudentProfileDto): Promise<ApiResponse<StudentProfileResponseDto>> {
    const response = await apiClient.put<ApiResponse<StudentProfileResponseDto>>('/api/student/profile', data);
    return response.data;
  },

  async deleteProfile(): Promise<ApiResponse<object>> {
    const response = await apiClient.delete<ApiResponse<object>>('/api/student/profile');
    return response.data;
  },
};

export default studentService;
