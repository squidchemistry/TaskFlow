import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { resetToLogin } from '../navigation/navigationRef';

const TOKEN_KEY = 'auth_token';
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:4000';

export const api = axios.create({ baseURL: API_URL });

// Attach stored token to every request
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

// Global 401 handler — only redirects when a token existed (prevents loop on login screen)
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      try {
        const existingToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (existingToken) {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          resetToLogin('Your session has expired. Please log in again.');
        }
      } catch {}
    }
    return Promise.reject(err);
  }
);

export const saveToken = (token) => SecureStore.setItemAsync(TOKEN_KEY, token);
export const clearToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);
export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY);

export default api;
