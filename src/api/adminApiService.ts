import { apiService } from './apiService'

export interface AdminLoginForm {
  email: string
  password: string
}

export interface AdminLoginResponse {
  success: boolean
  message: string
  data: {
    user: {
      id: number
      name: string
      email: string
      email_verified_at: string | null
      created_at: string
      updated_at: string
    }
    token: string
    token_type: string
  }
}

// Interface para solicitações de viagem de admin
export interface AdminTravelRequest {
  id: number
  user_id: number
  user: {
    id: number
    name: string
    email: string
  }
  name: string
  country: string
  town: string
  state: string
  region: string
  departure_date: string
  return_date: string
  status: string
  created_at: string
  updated_at: string
}

export interface AdminTravelRequestsResponse {
  success: boolean
  message: string
  data: {
    data: AdminTravelRequest[]
    links: {
      first: string | null
      last: string | null
      next: string | null
      prev: string | null
    }
    meta: {
      current_page: number
      from: number
      last_page: number
      per_page: number
      to: number
      total: number
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

// Function to login admin
export const adminLogin = async (credentials: AdminLoginForm): Promise<AdminLoginResponse> => {
  try {
    const response = await apiService.post<AdminLoginResponse>('/admin/login', credentials)
    return response.data
  } catch (error: any) {
    return handleApiError(error)
  }
}

// Function to get all travel requests for admin
export const getAllTravelRequests = async (
  page: number = 1
): Promise<AdminTravelRequestsResponse> => {
  try {
    const response = await apiService.get<AdminTravelRequestsResponse>(
      `/admin/travel-request/all?page=${page}`
    )
    return response.data
  } catch (error: any) {
    return handleApiError(error)
  }
}

// Function to update travel request status
export const updateTravelRequestStatus = async (
  requestId: number,
  status: string
): Promise<{ success: boolean; message: string; data: AdminTravelRequest }> => {
  try {
    const response = await apiService.patch<{
      success: boolean
      message: string
      data: AdminTravelRequest
    }>(`/admin/travel-request/${requestId}/update`, { status })
    return response.data
  } catch (error: any) {
    return handleApiError(error)
  }
}
