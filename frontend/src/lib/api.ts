import axios from "axios";
import { useAuthStore } from "../stores/auth";

const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export const api = axios.create({
  baseURL: `${apiBase}/api`,
});

let isRefreshing = false;
let pending: Array<() => void> = [];

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        await new Promise<void>((resolve) => pending.push(resolve));
        return api(original);
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) throw error;
        const { data } = await axios.post(`${apiBase}/api/auth/refresh`, {
          refreshToken,
        });
        useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
        pending.forEach((fn) => fn());
        pending = [];
        return api(original);
      } catch (e) {
        useAuthStore.getState().logout();
        throw e;
      } finally {
        isRefreshing = false;
      }
    }
    throw error;
  }
);






