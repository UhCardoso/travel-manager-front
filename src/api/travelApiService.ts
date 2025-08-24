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
  data: TravelRequest
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
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
    if (error.response?.data) {
      throw error.response.data
    }

    throw {
      success: false,
      message: 'Erro de conexão. Verifique sua internet e tente novamente.',
    } as ApiError
  }
}

// Function to get travel requests
export const getTravelRequests = async (): Promise<{ success: boolean; data: TravelRequest[] }> => {
  try {
    const response = await apiService.get<{ success: boolean; data: TravelRequest[] }>(
      '/user/travel-requests'
    )
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data
    }

    throw {
      success: false,
      message: 'Erro ao buscar solicitações de viagem.',
    } as ApiError
  }
}
