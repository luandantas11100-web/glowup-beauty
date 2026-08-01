import { api } from "../lib/api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
}

export async function loginRequest(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/login", credentials);
  return response.data;
}