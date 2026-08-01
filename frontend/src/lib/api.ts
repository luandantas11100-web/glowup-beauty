import axios, { type InternalAxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3333/api",
});

// Interceptor para injetar o Token JWT em todas as requisições autenticadas
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("@glowup:token") || sessionStorage.getItem("@glowup:token");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;