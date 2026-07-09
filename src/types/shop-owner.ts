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

export interface ShopOwnerProfileResponseDto {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  shopName: string;
  businessType: string;
  shopAddress: string;
  city: string;
  postcode: string;
  premisesLicenceNumber: string | null;
  businessVerificationStatus: BusinessVerificationStatus;
  consentToFollowUkEmploymentLaw: boolean;
  isProfileCompleted: boolean;
  createdAt: string;
  updatedAt: string | null;
  isActive: boolean;
}

export interface SaveShopOwnerProfileDto {
  fullName: string;
  email: string;
  phoneNumber: string;
  shopName: string;
  businessType: string;
  shopAddress: string;
  city: string;
  postcode: string;
  premisesLicenceNumber?: string | null;
  consentToFollowUkEmploymentLaw: boolean;
}

export interface BusinessDocumentResponseDto {
  id: string;
  shopOwnerProfileId: string;
  fileName: string;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
  verificationStatus: DocumentVerificationStatus;
  adminComment: string | null;
  isActive: boolean;
}
