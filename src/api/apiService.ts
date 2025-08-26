import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = 'http://localhost/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request logging interceptor
apiClient.interceptors.request.use(
  config => {
    let token = null
    try {
      const authStore = useAuthStore()
      token = authStore.token
    } catch {
      token = localStorage.getItem('authToken')
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Error interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      try {
        const authStore = useAuthStore()
        authStore.clearAuth()
      } catch {
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
      }
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export const apiService = apiClient
