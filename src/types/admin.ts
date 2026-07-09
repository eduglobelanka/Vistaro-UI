import type { JobPostingStatus, JobApplicationStatus } from './jobs';
import type { MessageType, InvitationStatus } from './messaging';

export const BusinessVerificationStatus = {
  Pending: 1,
  Approved: 2,
  Rejected: 3,
} as const;
export type BusinessVerificationStatus = typeof BusinessVerificationStatus[keyof typeof BusinessVerificationStatus];

export const DocumentVerificationStatus = {
  Pending: 1,
  Approved: 2,
  Rejected: 3,
} as const;
export type DocumentVerificationStatus = typeof DocumentVerificationStatus[keyof typeof DocumentVerificationStatus];

export interface AdminDashboardStatsDto {
  totalUsers: number;
  activeUsers: number;
  students: number;
  shopOwners: number;
  pendingShopOwners: number;
  approvedShopOwners: number;
  pendingBusinessDocuments: number;
  publishedJobPostings: number;
  pendingJobApplications: number;
  activeMessages: number;
}

export interface AdminQueryDto {
  search?: string | null;
  status?: string | null;
  pageNumber: number;
  pageSize: number;
}

export interface AdminPagedResponseDto<T> {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: T[];
}

export interface AdminUserResponseDto {
  id: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  roles: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface AdminShopOwnerResponseDto {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  shopName: string;
  businessType: string;
  city: string;
  postcode: string;
  businessVerificationStatus: BusinessVerificationStatus;
  adminComment: string | null;
  isProfileCompleted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface AdminCommentDto {
  comment: string;
}

export interface AdminBusinessDocumentResponseDto {
  id: string;
  shopOwnerProfileId: string;
  shopName: string;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
  updatedAt: string | null;
  verificationStatus: DocumentVerificationStatus;
  adminComment: string | null;
  isActive: boolean;
}

export interface AdminJobPostingResponseDto {
  id: string;
  shopOwnerProfileId: string;
  shopName: string;
  jobTitle: string;
  jobCategory: string;
  city: string;
  postcode: string;
  status: JobPostingStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface AdminJobApplicationResponseDto {
  id: string;
  jobPostingId: string;
  jobTitle: string;
  studentProfileId: string;
  studentFullName: string;
  shopName: string;
  status: JobApplicationStatus;
  appliedAt: string;
  updatedAt: string | null;
  isActive: boolean;
}

export interface AdminMessageResponseDto {
  id: string;
  senderUserId: string;
  receiverUserId: string;
  messageText: string;
  messageType: MessageType;
  invitationStatus: InvitationStatus;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogResponseDto {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string | null;
  description: string;
  ipAddress: string | null;
  createdAt: string;
}
