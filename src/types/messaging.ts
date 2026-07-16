export const MessageType = {
  GeneralMessage: 1,
  JobInvitation: 2,
} as const;
export type MessageType = typeof MessageType[keyof typeof MessageType];

export const InvitationStatus = {
  None: 1,
  Pending: 2,
  Accepted: 3,
  Declined: 4,
} as const;
export type InvitationStatus = typeof InvitationStatus[keyof typeof InvitationStatus];

export interface MessageResponseDto {
  id: string;
  senderUserId: string;
  receiverUserId: string;
  studentProfileId: string;
  shopOwnerProfileId: string;
  relatedJobPostingId: string | null;
  messageText: string;
  messageType: MessageType;
  invitationStatus: InvitationStatus;
  isRead: boolean;
  createdAt: string;
  updatedAt: string | null;
  studentFullName: string;
  shopName: string;
  relatedJobTitle: string | null;
  jobApplicationId?: string | null;
  moderationStatus?: number | null;
}

export interface SendMessageDto {
  studentProfileId: string;
  shopOwnerProfileId?: string | null;
  relatedJobPostingId?: string | null;
  messageText: string;
  messageType: MessageType;
  jobApplicationId: string;
}

export interface SendJobInvitationDto {
  studentProfileId: string;
  jobPostingId: string;
  messageText: string;
}

export interface JobInvitationResponseDto {
  id: string;
  conversationId: string;
  jobPostingId: string;
  jobTitle: string;
  status: InvitationStatus;
  sentAt: string;
  respondedAt: string | null;
}

export interface NotificationResponseDto {
  id: string;
  title: string;
  message: string;
  notificationType: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}
