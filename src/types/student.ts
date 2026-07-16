export const VisaType = {
  StudentVisa: 1,
  GraduateVisa: 2,
  OtherVisa: 3,
  NeedsRightToWorkVerification: 4,
  PreferNotToSayUntilVerified: 5,
} as const;
export type VisaType = typeof VisaType[keyof typeof VisaType];

export const EmploymentPreference = {
  PartTime: 1,
  FullTime: 2,
} as const;
export type EmploymentPreference = typeof EmploymentPreference[keyof typeof EmploymentPreference];

export interface StudentProfileResponseDto {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  universityName: string;
  city: string;
  postcode: string;
  visaType: VisaType;
  employmentPreference: EmploymentPreference;
  dateOfBirth: string; // ISO Date YYYY-MM-DD
  maxHoursPerWeek: number;
  consentToShareProfile: boolean;
  isAvailableForWork: boolean;
  preferredJobCategories: string | null;
  preferredSearchRadius: number | null;
  expectedHourlyRate: number | null;
  createdAt: string;
  updatedAt: string | null;
  isActive: boolean;
}

export interface SaveStudentProfileDto {
  fullName: string;
  email: string;
  phoneNumber: string;
  universityName: string;
  city: string;
  postcode: string;
  visaType: VisaType;
  employmentPreference: EmploymentPreference;
  rightToWorkShareCode?: string | null;
  dateOfBirth: string; // ISO Date YYYY-MM-DD
  maxHoursPerWeek: number;
  consentToShareProfile: boolean;
  isAvailableForWork: boolean;
  preferredJobCategories?: string | null;
  preferredSearchRadius?: number | null;
  expectedHourlyRate?: number | null;
}

export interface AvailableStudentSearchRequestDto {
  city?: string | null;
  postcode?: string | null;
  preferredJobCategory?: string | null;
  employmentPreference?: EmploymentPreference | null;
  maxHoursPerWeek?: number | null;
  preferredSearchRadius?: number | null;
  visaType?: VisaType | null;
  pageNumber: number;
  pageSize: number;
  sortBy: string;
}

export interface AvailableStudentSearchResultDto {
  studentProfileId: string;
  candidateCode: string;
  universityName: string;
  city: string;
  employmentPreference: EmploymentPreference;
  maxHoursPerWeek: number;
  preferredJobCategories: string | null;
  expectedHourlyRate: number | null;
  isAvailableForWork: boolean;
}

export interface AvailableStudentSearchResponseDto {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: AvailableStudentSearchResultDto[];
}
