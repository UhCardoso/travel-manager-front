import { apiService } from './apiService'

export interface CreateTravelRequest {
  name: string
  country?: string
  town?: string
  state?: string
  region?: string
  departure_date: string
  return_date: string
}

export interface TravelRequest {
  id: number
  user_id: number
  name: string
  country?: string
  town?: string
  state?: string
  region?: string
  departure_date: string
  return_date: string
  status: string
  created_at: string
  updated_at: string
}

export interface CreateTravelResponse {
  success: boolean
  message: string
}

export interface TravelRequestsResponse {
  success: boolean
  message: string
  data: {
    data: TravelRequest[]
    links: {
      first: string
      last: string
      prev: string | null
      next: string | null
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

export interface CancelTravelRequestResponse {
  success: boolean
  message: string
  data: TravelRequest
}

export interface TravelRequestDetailsResponse {
  success: boolean
  message: string
  data: TravelRequest
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

// Function to create travel request
export const createTravelRequest = async (
  travelData: CreateTravelRequest
): Promise<CreateTravelResponse> => {
  try {
    const requestData = {
      name: travelData.name.trim(),
      country: travelData.country?.trim(),
      town: travelData.town?.trim(),
      state: travelData.state?.trim(),
      region: travelData.region?.trim(),
      departure_date: travelData.departure_date,
      return_date: travelData.return_date,
    }

    const response = await apiService.post<CreateTravelResponse>(
      '/user/travel-request/create',
      requestData
    )
    return response.data
  } catch (error: any) {
    return handleApiError(error)
  }
}

// Function to get all travel requests for the user
export const getUserTravelRequests = async (params?: {
  page?: number
}): Promise<TravelRequestsResponse> => {
  try {
    const queryParams = params?.page ? `?page=${params.page}` : ''
    const response = await apiService.get<TravelRequestsResponse>(
      `/user/travel-request/all${queryParams}`
    )
    return response.data
  } catch (error: any) {
    return handleApiError(error)
  }
}

// Function to cancel travel request
export const cancelTravelRequest = async (
  requestId: number
): Promise<CancelTravelRequestResponse> => {
  try {
    const response = await apiService.patch<CancelTravelRequestResponse>(
      `/user/travel-request/${requestId}/cancel`
    )
    return response.data
  } catch (error: any) {
    return handleApiError(error)
  }
}

// Function to get travel request details
export const getTravelRequestDetails = async (
  requestId: number
): Promise<TravelRequestDetailsResponse> => {
  try {
    const response = await apiService.get<TravelRequestDetailsResponse>(
      `/user/travel-request/${requestId}/details`
    )
    return response.data
  } catch (error: any) {
    return handleApiError(error)
  }
}
