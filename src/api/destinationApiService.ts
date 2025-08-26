// Interfaces for typing
export interface DestinationAddress {
  country?: string
  town?: string
  state?: string
  region?: string
  municipality?: string
  county?: string
  state_district?: string
  ISO3166_2_lvl4?: string
  country_code?: string
}

export interface DestinationResult {
  place_id: number
  licence: string
  osm_type: string
  osm_id: number
  lat: string
  lon: string
  class: string
  type: string
  place_rank: number
  importance: number
  addresstype: string
  name: string
  display_name: string
  address: DestinationAddress
  boundingbox: string[]
}

export interface DestinationSearchResponse {
  success: boolean
  data: DestinationResult[]
  message?: string
}

// Function to search destinations using OpenStreetMap Nominatim API
export const searchDestinations = async (query: string): Promise<DestinationResult[]> => {
  if (!query.trim()) {
    return []
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1`
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: DestinationResult[] = await response.json()
    return data
  } catch (error) {
    console.error('Erro na busca de destinos:', error)
    throw new Error('Erro ao buscar destinos. Verifique sua conexão e tente novamente.')
  }
}

// Function to format address for display
export const formatDestinationAddress = (address: DestinationAddress): string => {
  const parts = []

  if (address.country) parts.push(address.country)
  if (address.town) parts.push(address.town)
  if (address.state) parts.push(address.state)
  if (address.region) parts.push(address.region)

  return parts.join(' - ')
}

// Function to get full location details
export const getLocationDetails = (destination: DestinationResult) => {
  return {
    name: destination.name,
    coordinates: {
      lat: destination.lat,
      lon: destination.lon,
    },
    address: destination.address,
    formattedAddress: formatDestinationAddress(destination.address),
    displayName: destination.display_name,
  }
}
