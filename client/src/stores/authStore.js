import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', credentials);
          const { user, token } = response.data;
          
          set({ 
            user, 
            token, 
            isLoading: false,
            error: null 
          });
          
          // Set token for future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          return { success: true, user, token };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Login failed';
          set({ 
            error: errorMessage, 
            isLoading: false,
            user: null,
            token: null 
          });
          return { success: false, error: errorMessage };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/register', userData);
          const { user, token } = response.data;
          
          set({ 
            user, 
            token, 
            isLoading: false,
            error: null 
          });
          
          // Set token for future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          return { success: true, user, token };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Registration failed';
          set({ 
            error: errorMessage, 
            isLoading: false,
            user: null,
            token: null 
          });
          return { success: false, error: errorMessage };
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ 
            user: null, 
            token: null, 
            error: null 
          });
          delete api.defaults.headers.common['Authorization'];
        }
      },

      updatePreferences: async (preferences) => {
        try {
          const response = await api.patch('/auth/preferences', preferences);
          set((state) => ({
            user: {
              ...state.user,
              preferences: response.data.preferences
            }
          }));
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to update preferences';
          set({ error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      checkAuth: async () => {
        const token = get().token;
        if (!token) return;

        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/auth/me');
          set({ user: response.data.user });
        } catch (error) {
          console.error('Auth check failed:', error);
          set({ user: null, token: null });
          delete api.defaults.headers.common['Authorization'];
        }
      },

      refreshToken: async () => {
        try {
          const response = await api.post('/auth/refresh');
          const { token } = response.data;
          
          set({ token });
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          return { success: true };
        } catch (error) {
          console.error('Token refresh failed:', error);
          set({ user: null, token: null });
          delete api.defaults.headers.common['Authorization'];
          return { success: false };
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user 
      }),
    }
  )
);
