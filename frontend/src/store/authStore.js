import { create } from 'zustand'
import api from '../api/axios'

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('access_token'),

  login: async (username, password) => {
    const { data } = await api.post('auth/login/', { username, password })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    const me = await api.get('auth/me/')
    set({ user: me.data, isAuthenticated: true })
  },

  register: async (payload) => {
    await api.post('auth/register/', payload)
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get('auth/me/')
      set({ user: data, isAuthenticated: true })
    } catch (err) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      set({ user: null, isAuthenticated: false })
    }
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({ user: null, isAuthenticated: false })
  },
}))

export default useAuthStore
