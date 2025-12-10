import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem('authToken');
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API methods
export const authAPI = {
    // Register new user
    register: async (email: string, username: string) => {
        const response = await api.post('/auth/register', { email, username });
        return response.data;
    },

    // Passkey Registration
    getPasskeyRegisterOptions: async () => {
        const response = await api.post('/auth/passkey/register-options');
        return response.data;
    },

    verifyPasskeyRegistration: async (credential: any) => {
        const response = await api.post('/auth/passkey/register-verify', { credential });
        return response.data;
    },

    // Passkey Login
    getPasskeyLoginOptions: async (email: string) => {
        const response = await api.post('/auth/passkey/login-options', { email });
        return response.data;
    },

    verifyPasskeyLogin: async (email: string, credential: any) => {
        const response = await api.post('/auth/passkey/login-verify', { email, credential });
        return response.data;
    },

    // 2FA
    setup2FA: async () => {
        const response = await api.post('/auth/2fa/setup');
        return response.data;
    },

    verify2FA: async (token: string) => {
        const response = await api.post('/auth/2fa/verify', { token });
        return response.data;
    },

    validate2FA: async (token: string) => {
        const response = await api.post('/auth/2fa/validate', { token });
        return response.data;
    },

    disable2FA: async (token: string) => {
        const response = await api.post('/auth/2fa/disable', { token });
        return response.data;
    },

    // Get current user
    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
};

export default api;
