import axios, { type InternalAxiosRequestConfig } from "axios";

export const API_URL = "http://localhost:3333";

export const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Interceptor para injetar o Token JWT em todas as requisições autenticadas
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token =
    sessionStorage.getItem("hg-admin-token") ||
    localStorage.getItem("hg-admin-token") ||
    localStorage.getItem("@glowup:token") ||
    sessionStorage.getItem("@glowup:token");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Helper exportado para formatação de URLs de imagens
export function getImageUrl(imagePath: string): string {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  return `${API_URL}${imagePath}`;
}

export default api;