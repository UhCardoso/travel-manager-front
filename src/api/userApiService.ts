import { apiService } from './apiService'

export interface UserLoginForm {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    token: string
    user: {
      id: number
      name: string
      email: string
    }
  }
}

export interface UserRegisterForm {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface RegisterResponse {
  success: boolean
  message: string
  data: {
    token: string
    user: {
      id: number
      name: string
      email: string
    }
  }
}

export interface ApiError {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}

// Helper function to handle API errors
const handleApiError = (error: any): never => {
  if (error.response?.data) {
    throw error.response.data
  }

  throw {
    success: false,
    message: 'Erro de conexão. Verifique sua internet e tente novamente.',
  }
}

// Function to login user
export const userLogin = async (credentials: UserLoginForm): Promise<LoginResponse> => {
  try {
    const response = await apiService.post<LoginResponse>('/user/login', credentials)
    return response.data
  } catch (error: any) {
    return handleApiError(error)
  }
}

// Function to register user
export const userRegister = async (userData: UserRegisterForm): Promise<RegisterResponse> => {
  try {
    const response = await apiService.post<RegisterResponse>('/user/register', userData)
    return response.data
  } catch (error: any) {
    return handleApiError(error)
  }
}

// Function to logout user
export const userLogout = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiService.post<{ success: boolean; message: string }>('/user/logout')
    return response.data
  } catch (error: any) {
    return handleApiError(error)
  }
}
