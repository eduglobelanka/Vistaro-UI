import type { JobApplicationStatus } from './jobs';

export const AdminReviewStatus = {
  NotReviewed: 1,
  InReview: 2,
  ApprovedForEmployer: 3,
  Rejected: 4,
  MoreInformationRequired: 5,
} as const;
export type AdminReviewStatus = typeof AdminReviewStatus[keyof typeof AdminReviewStatus];

export const EmployerApplicationStatus = {
  NotVisible: 1,
  EmployerReview: 2,
  Shortlisted: 3,
  InterviewRequested: 4,
  InterviewApproved: 5,
  OfferPending: 6,
  OfferAccepted: 7,
  Hired: 8,
  Rejected: 9,
} as const;
export type EmployerApplicationStatus = typeof EmployerApplicationStatus[keyof typeof EmployerApplicationStatus];

export const ModerationStatus = {
  Pending: 1,
  Approved: 2,
  Rejected: 3,
} as const;
export type ModerationStatus = typeof ModerationStatus[keyof typeof ModerationStatus];

export interface AdminJobApplicationResponseDto {
  id: string;
  jobPostingId: string;
  jobTitle: string;
  studentProfileId: string;
  studentFullName: string;
  shopName: string;
  status: JobApplicationStatus;
  adminReviewStatus: AdminReviewStatus;
  adminComment: string | null;
  employerStatus: EmployerApplicationStatus;
  adminReviewedAt: string | null;
  employerReviewedAt: string | null;
  interviewRequestedAt: string | null;
  contactReleasedAt: string | null;
  appliedAt: string;
  updatedAt: string | null;
  isActive: boolean;
}

export interface ModeratedMessageResponseDto {
  id: string;
  jobApplicationId: string;
  senderUserId: string;
  receiverUserId: string;
  messageText: string;
  moderationStatus: ModerationStatus;
  reviewedByAdminId: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  isRead: boolean;
}

export interface ContactReleaseResponseDto {
  id: string;
  studentProfileId: string;
  shopOwnerProfileId: string;
  jobApplicationId: string;
  approvedByAdminId: string;
  releasedFields: string;
  reason: string;
  approvedAt: string;
}

export interface SendModeratedMessageDto {
  jobApplicationId: string;
  messageText: string;
}

export interface RequestContactReleaseDto {
  reason: string;
}

export interface AdminApplicationReviewDto {
  adminComment?: string | null;
}

export interface AdminContactReleaseDto {
  releasedFields: string;
  reason: string;
}

export interface AdminModeratedMessageReviewDto {
  rejectionReason?: string | null;
}
