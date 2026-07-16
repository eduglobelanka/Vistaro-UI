export const EmploymentType = {
  PartTime: 1,
  FullTime: 2,
  Both: 3,
} as const;
export type EmploymentType = typeof EmploymentType[keyof typeof EmploymentType];

export const ContractType = {
  Immediate: 1,
  Temporary: 2,
  Permanent: 3,
} as const;
export type ContractType = typeof ContractType[keyof typeof ContractType];

export const SalaryType = {
  Hourly: 1,
  Daily: 2,
  Weekly: 3,
  Monthly: 4,
} as const;
export type SalaryType = typeof SalaryType[keyof typeof SalaryType];

export const JobPostingStatus = {
  Draft: 1,
  Published: 2,
  Closed: 3,
} as const;
export type JobPostingStatus = typeof JobPostingStatus[keyof typeof JobPostingStatus];

import type { AdminReviewStatus, EmployerApplicationStatus } from './recruitment';

export const JobApplicationStatus = {
  SubmittedToAdmin: 1,
  AdminReview: 2,
  MoreInformationRequired: 3,
  ApprovedForEmployer: 4,
  RejectedByAdmin: 5,
  EmployerReview: 6,
  Shortlisted: 7,
  InterviewRequested: 8,
  InterviewApproved: 9,
  OfferPending: 10,
  OfferAccepted: 11,
  Hired: 12,
  RejectedByEmployer: 13,
  Withdrawn: 14,
} as const;
export type JobApplicationStatus = typeof JobApplicationStatus[keyof typeof JobApplicationStatus];

export interface JobPostingResponseDto {
  id: string;
  shopOwnerProfileId: string;
  jobTitle: string;
  description: string;
  jobCategory: string;
  employmentType: EmploymentType;
  contractType: ContractType;
  salaryType: SalaryType;
  salaryAmount: number;
  hoursPerWeek: number;
  location: string;
  city: string;
  postcode: string;
  startDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  status: JobPostingStatus;
  createdAt: string;
  updatedAt: string | null;
  isActive: boolean;
}

export interface SaveJobPostingDto {
  jobTitle: string;
  description: string;
  jobCategory: string;
  employmentType: EmploymentType;
  contractType: ContractType;
  salaryType: SalaryType;
  salaryAmount: number;
  hoursPerWeek: number;
  location: string;
  city: string;
  postcode: string;
  startDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  status: JobPostingStatus;
}

export interface JobSearchRequestDto {
  keyword?: string | null;
  jobCategory?: string | null;
  employmentType?: EmploymentType | null;
  contractType?: ContractType | null;
  city?: string | null;
  postcode?: string | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  hoursPerWeek?: number | null;
  startDate?: string | null;
  pageNumber: number;
  pageSize: number;
  sortBy: string;
}

export interface JobSearchResultDto {
  id: string;
  jobTitle: string;
  description: string;
  jobCategory: string;
  employmentType: EmploymentType;
  contractType: ContractType;
  salaryType: SalaryType;
  salaryAmount: number;
  hoursPerWeek: number;
  location: string;
  city: string;
  postcode: string;
  startDate: string;
  expiryDate: string;
  createdAt: string;
  shopName: string;
  businessType: string;
  shopCity: string;
  shopPostcode: string;
}

export interface JobSearchResponseDto {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: JobSearchResultDto[];
}

export interface JobApplicationResponseDto {
  id: string;
  jobPostingId: string;
  studentProfileId: string;
  coverMessage: string | null;
  status: JobApplicationStatus;
  adminReviewStatus: AdminReviewStatus;
  adminComment: string | null;
  employerStatus: EmployerApplicationStatus;
  appliedAt: string;
  updatedAt: string | null;
  adminReviewedAt: string | null;
  employerReviewedAt: string | null;
  interviewRequestedAt: string | null;
  contactReleasedAt: string | null;
  isContactReleased: boolean;
  isActive: boolean;
  jobTitle: string;
  jobCategory: string;
  jobCity: string;
  shopName: string;
  studentFullName: string;
  candidateCode: string;
  studentEmail: string | null;
  studentPhoneNumber: string | null;
  studentCity: string;
}

export interface ApplyJobApplicationDto {
  coverMessage?: string | null;
}

export interface UpdateJobApplicationStatusDto {
  status: JobApplicationStatus;
}
