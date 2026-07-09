import apiClient from './api-client';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserSummary,
} from '../types/auth';

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/refresh-token', {
      refreshToken,
    });
    return response.data;
  },

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    await apiClient.post('/api/auth/revoke-refresh-token', {
      refreshToken,
    });
  },

  async me(): Promise<UserSummary> {
    const response = await apiClient.get<UserSummary>('/api/auth/me');
    return response.data;
  },
};

export default authService;
