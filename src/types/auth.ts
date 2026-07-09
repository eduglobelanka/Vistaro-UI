export interface UserSummary {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAtUtc: string;
  refreshTokenExpiresAtUtc: string;
  user: UserSummary;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string; // 'Student' | 'ShopOwner' | 'Admin'
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RevokeRefreshTokenRequest {
  refreshToken: string;
}
