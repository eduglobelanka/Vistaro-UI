import apiClient from './api-client';
import type { ApiResponse } from '../types/api';
import type {
  AdminDashboardStatsDto,
  AdminQueryDto,
  AdminPagedResponseDto,
  AdminUserResponseDto,
  AdminShopOwnerResponseDto,
  AdminBusinessDocumentResponseDto,
  AdminJobPostingResponseDto,
  AdminJobApplicationResponseDto,
  AdminMessageResponseDto,
  AuditLogResponseDto,
} from '../types/admin';

const buildQueryString = (query: AdminQueryDto) => {
  const params = new URLSearchParams();
  if (query.search) params.append('search', query.search);
  if (query.status) params.append('status', query.status);
  params.append('pageNumber', query.pageNumber.toString());
  params.append('pageSize', query.pageSize.toString());
  return params.toString();
};

export const adminService = {
  async getDashboardStats(): Promise<ApiResponse<AdminDashboardStatsDto>> {
    const response = await apiClient.get<ApiResponse<AdminDashboardStatsDto>>('/api/admin/dashboard/stats');
    return response.data;
  },

  async getUsers(query: AdminQueryDto): Promise<ApiResponse<AdminPagedResponseDto<AdminUserResponseDto>>> {
    const qs = buildQueryString(query);
    const response = await apiClient.get<ApiResponse<AdminPagedResponseDto<AdminUserResponseDto>>>(`/api/admin/users?${qs}`);
    return response.data;
  },

  async getUser(id: string): Promise<ApiResponse<AdminUserResponseDto>> {
    const response = await apiClient.get<ApiResponse<AdminUserResponseDto>>(`/api/admin/users/${id}`);
    return response.data;
  },

  async activateUser(id: string): Promise<ApiResponse<AdminUserResponseDto>> {
    const response = await apiClient.put<ApiResponse<AdminUserResponseDto>>(`/api/admin/users/${id}/activate`);
    return response.data;
  },

  async deactivateUser(id: string): Promise<ApiResponse<AdminUserResponseDto>> {
    const response = await apiClient.put<ApiResponse<AdminUserResponseDto>>(`/api/admin/users/${id}/deactivate`);
    return response.data;
  },

  async deleteUser(id: string): Promise<ApiResponse<AdminUserResponseDto>> {
    const response = await apiClient.delete<ApiResponse<AdminUserResponseDto>>(`/api/admin/users/${id}`);
    return response.data;
  },

  async getShopOwners(query: AdminQueryDto): Promise<ApiResponse<AdminPagedResponseDto<AdminShopOwnerResponseDto>>> {
    const qs = buildQueryString(query);
    const response = await apiClient.get<ApiResponse<AdminPagedResponseDto<AdminShopOwnerResponseDto>>>(`/api/admin/shop-owners?${qs}`);
    return response.data;
  },

  async getShopOwner(id: string): Promise<ApiResponse<AdminShopOwnerResponseDto>> {
    const response = await apiClient.get<ApiResponse<AdminShopOwnerResponseDto>>(`/api/admin/shop-owners/${id}`);
    return response.data;
  },

  async approveShopOwner(id: string): Promise<ApiResponse<AdminShopOwnerResponseDto>> {
    const response = await apiClient.put<ApiResponse<AdminShopOwnerResponseDto>>(`/api/admin/shop-owners/${id}/approve`);
    return response.data;
  },

  async rejectShopOwner(id: string, comment: string): Promise<ApiResponse<AdminShopOwnerResponseDto>> {
    const response = await apiClient.put<ApiResponse<AdminShopOwnerResponseDto>>(`/api/admin/shop-owners/${id}/reject`, { comment });
    return response.data;
  },

  async getBusinessDocuments(query: AdminQueryDto): Promise<ApiResponse<AdminPagedResponseDto<AdminBusinessDocumentResponseDto>>> {
    const qs = buildQueryString(query);
    const response = await apiClient.get<ApiResponse<AdminPagedResponseDto<AdminBusinessDocumentResponseDto>>>(`/api/admin/business-documents?${qs}`);
    return response.data;
  },

  async approveBusinessDocument(id: string): Promise<ApiResponse<AdminBusinessDocumentResponseDto>> {
    const response = await apiClient.put<ApiResponse<AdminBusinessDocumentResponseDto>>(`/api/admin/business-documents/${id}/approve`);
    return response.data;
  },

  async rejectBusinessDocument(id: string, comment: string): Promise<ApiResponse<AdminBusinessDocumentResponseDto>> {
    const response = await apiClient.put<ApiResponse<AdminBusinessDocumentResponseDto>>(`/api/admin/business-documents/${id}/reject`, { comment });
    return response.data;
  },

  async getJobPostings(query: AdminQueryDto): Promise<ApiResponse<AdminPagedResponseDto<AdminJobPostingResponseDto>>> {
    const qs = buildQueryString(query);
    const response = await apiClient.get<ApiResponse<AdminPagedResponseDto<AdminJobPostingResponseDto>>>(`/api/admin/job-postings?${qs}`);
    return response.data;
  },

  async approveJobPosting(id: string): Promise<ApiResponse<AdminJobPostingResponseDto>> {
    const response = await apiClient.put<ApiResponse<AdminJobPostingResponseDto>>(`/api/admin/job-postings/${id}/approve`);
    return response.data;
  },

  async closeJobPosting(id: string): Promise<ApiResponse<AdminJobPostingResponseDto>> {
    const response = await apiClient.put<ApiResponse<AdminJobPostingResponseDto>>(`/api/admin/job-postings/${id}/close`);
    return response.data;
  },

  async deactivateJobPosting(id: string): Promise<ApiResponse<AdminJobPostingResponseDto>> {
    const response = await apiClient.put<ApiResponse<AdminJobPostingResponseDto>>(`/api/admin/job-postings/${id}/deactivate`);
    return response.data;
  },

  async deleteJobPosting(id: string): Promise<ApiResponse<AdminJobPostingResponseDto>> {
    const response = await apiClient.delete<ApiResponse<AdminJobPostingResponseDto>>(`/api/admin/job-postings/${id}`);
    return response.data;
  },

  async getJobApplications(query: AdminQueryDto): Promise<ApiResponse<AdminPagedResponseDto<AdminJobApplicationResponseDto>>> {
    const qs = buildQueryString(query);
    const response = await apiClient.get<ApiResponse<AdminPagedResponseDto<AdminJobApplicationResponseDto>>>(`/api/admin/job-applications?${qs}`);
    return response.data;
  },

  async getMessages(query: AdminQueryDto): Promise<ApiResponse<AdminPagedResponseDto<AdminMessageResponseDto>>> {
    const qs = buildQueryString(query);
    const response = await apiClient.get<ApiResponse<AdminPagedResponseDto<AdminMessageResponseDto>>>(`/api/admin/messages?${qs}`);
    return response.data;
  },

  async getAuditLogs(count: number): Promise<ApiResponse<AuditLogResponseDto[]>> {
    const response = await apiClient.get<ApiResponse<AuditLogResponseDto[]>>(`/api/admin/audit-logs?count=${count}`);
    return response.data;
  },
};

export default adminService;
