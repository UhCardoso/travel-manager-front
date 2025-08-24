import { apiService } from './apiService'

// Interfaces para tipagem
export interface LoginRequest {
  email: string
  password: string
}

export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    user: User
    token: string
    token_type: string
  }
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
}

// Function to login user
export const userLogin = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const requestData = {
      email: credentials.email.trim(),
      password: credentials.password,
    }

    const response = await apiService.post<LoginResponse>('/user/login', requestData)
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data
    }

    throw {
      success: false,
      message: 'Erro de conexão. Verifique sua internet e tente novamente.',
    } as ApiError
  }
}

// Function to logout
export const userLogout = async (): Promise<void> => {
  try {
    await apiService.post('/user/logout')
  } catch (error: any) {
    console.warn('Erro ao fazer logout no servidor:', error)
  }
}
