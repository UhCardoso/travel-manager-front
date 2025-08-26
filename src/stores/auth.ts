import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/api/userApiService'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(null)
  const user = ref<User | null>(null)
  const loading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const userData = computed(() => user.value)

  // Actions
  const setAuth = (authToken: string, userData: User) => {
    token.value = authToken
    user.value = userData
    // Persistir no localStorage como backup
    localStorage.setItem('authToken', authToken)
    localStorage.setItem('userData', JSON.stringify(userData))
  }

  const clearAuth = () => {
    token.value = null
    user.value = null
    // Limpar localStorage
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
  }

  const initializeAuth = () => {
    // Tentar restaurar do localStorage ao inicializar
    const storedToken = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('userData')

    if (storedToken && storedUser) {
      try {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
      } catch (error) {
        console.error('Erro ao restaurar autenticação:', error)
        clearAuth()
      }
    }
  }

  return {
    // State
    token,
    user,
    loading,

    // Getters
    isAuthenticated,
    userData,

    // Actions
    setAuth,
    clearAuth,
    initializeAuth,
  }
})
