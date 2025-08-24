<template>
  <div class="page">
    <div class="card">
      <header class="header">
        <div class="brand">
          <svg class="brand-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            />
          </svg>
          <h1 class="brand-title">Travel Manager</h1>
        </div>

        <h2 class="title">Nova Solicitação de Viagem</h2>
        <p class="subtitle">Preencha o local de destino e as datas da sua viagem</p>
      </header>

      <form class="form" @submit.prevent="handleSubmit" novalidate>
        <div class="destination-search">
          <div class="search-input-wrapper">
            <BaseInput
              id="destination_search"
              v-model="searchQuery"
              label="Local de destino (Nome da viagem)"
              type="text"
              placeholder="Digite o nome da cidade ou local"
              autocomplete="off"
              required
              :error="errors.name"
              @input="handleSearchInput"
              @blur="handleBlur('destination_search')"
            />
          </div>

          <div v-if="showDropdown" class="search-dropdown">
            <div v-if="searchLoading" class="search-loading-state">
              <svg class="loading-spinner" viewBox="0 0 24 24" aria-hidden="true">
                <circle
                  class="spinner-circle"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                />
              </svg>
              <span class="loading-text">Buscando destinos...</span>
            </div>

            <div
              v-else-if="searchResults.length > 0"
              v-for="(result, index) in searchResults"
              :key="result.place_id"
              class="search-result-item"
              @click="selectDestination(result)"
            >
              <div class="result-name">{{ result.name }}</div>
              <div class="result-details">
                {{ formatDestinationAddress(result.address) }}
              </div>
            </div>

            <div v-else-if="!searchLoading && searchQuery.trim()" class="no-results">
              <span class="no-results-text">Nenhum destino encontrado</span>
            </div>
          </div>
        </div>

        <div v-if="selectedDestination" class="destination-details">
          <h3 class="details-title">Detalhes do Destino</h3>
          <div class="details-content">
            <div class="detail-item">
              <span class="detail-label">Cidade:</span>
              <span class="detail-value">{{ selectedDestination.name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Localização:</span>
              <span class="detail-value">{{
                formatDestinationAddress(selectedDestination.address)
              }}</span>
            </div>
          </div>
        </div>

        <BaseInput
          id="departure_date"
          v-model="formData.departure_date"
          label="Data de partida"
          type="date"
          required
          :error="errors.departure_date"
          @blur="handleBlur('departure_date')"
        />

        <BaseInput
          id="return_date"
          v-model="formData.return_date"
          label="Data de retorno"
          type="date"
          required
          :error="errors.return_date"
          @blur="handleBlur('return_date')"
        />

        <div class="form-actions">
          <BaseButton type="button" variant="outline" @click="handleCancel" :disabled="loading">
            Cancelar
          </BaseButton>
          <BaseButton type="submit" variant="primary" :loading="loading" :full-width="false">
            {{ loading ? 'Criando...' : 'Criar Solicitação' }}
          </BaseButton>
        </div>

        <p v-if="errors.general" class="error-general">{{ errors.general }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { BaseInput, BaseButton } from '@/components/ui'
import { useAuthStore } from '@/stores/auth'
import {
  searchDestinations,
  formatDestinationAddress,
  type DestinationResult,
} from '@/api/destinationApiService'
import {
  createTravelRequest,
  type CreateTravelRequest as CreateTravelRequestType,
  type CreateTravelResponse,
  type ApiError,
} from '@/api/travelApiService'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const errors = reactive<Record<string, string>>({})

const formData = reactive({
  departure_date: '',
  return_date: '',
})

// Search functionality
const searchQuery = ref('')
const searchResults = ref<DestinationResult[]>([])
const selectedDestination = ref<DestinationResult | null>(null)
const showDropdown = ref(false)
const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
const searchLoading = ref(false)

// Check if logged in when loading the page
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/')
  }
})

// Cleanup timeout on unmount
onUnmounted(() => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})

// Validate form fields
const validateField = (field: string) => {
  const value = formData[field as keyof typeof formData]

  if (!value) {
    errors[field] = 'Este campo é obrigatório'
    return false
  }

  if (field === 'departure_date' || field === 'return_date') {
    const date = new Date(value)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (isNaN(date.getTime())) {
      errors[field] = 'Data inválida'
      return false
    }

    if (date < today) {
      errors[field] = 'A data não pode ser no passado'
      return false
    }
  }

  if (field === 'return_date' && formData.departure_date) {
    const departureDate = new Date(formData.departure_date)
    const returnDate = new Date(value)

    if (isNaN(departureDate.getTime()) || isNaN(returnDate.getTime())) {
      return true
    }

    if (returnDate <= departureDate) {
      errors[field] = 'A data de retorno deve ser posterior à data de partida'
      return false
    }
  }

  delete errors[field]
  return true
}

// Validate form data
const validateForm = () => {
  const fields = ['departure_date', 'return_date']
  let isValid = true

  fields.forEach(field => {
    if (!validateField(field)) {
      isValid = false
    }
  })

  if (!selectedDestination.value) {
    errors.general = 'Selecione um destino válido da lista de busca'
    isValid = false
  }

  if (!searchQuery.value.trim()) {
    errors.general = 'Preencha o local de destino'
    isValid = false
  }

  return isValid
}

// Search destination function
const searchDestination = async (query: string) => {
  if (!query.trim()) {
    searchResults.value = []
    showDropdown.value = false
    return
  }

  searchLoading.value = true
  showDropdown.value = true

  try {
    const results = await searchDestinations(query)
    searchResults.value = results
  } catch (error) {
    console.error('Erro na busca:', error)
    searchResults.value = []
    errors.name = 'Erro ao buscar destinos. Tente novamente.'
  } finally {
    searchLoading.value = false
  }
}

// Handle search input with debounce
const handleSearchInput = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  searchTimeout.value = setTimeout(() => {
    searchDestination(searchQuery.value)
  }, 1000)
}

// Select destination from search results
const selectDestination = (destination: DestinationResult) => {
  selectedDestination.value = destination
  searchQuery.value = destination.name
  searchResults.value = []
  showDropdown.value = false
  searchLoading.value = false

  // Clear search timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
}

// Handle submit form
const handleSubmit = async () => {
  Object.keys(errors).forEach(k => delete errors[k])

  if (!validateForm()) return

  loading.value = true

  try {
    const travelData: CreateTravelRequestType = {
      name: searchQuery.value,
      country: selectedDestination.value?.address.country,
      town: selectedDestination.value?.address.town,
      state: selectedDestination.value?.address.state,
      region: selectedDestination.value?.address.region,
      departure_date: formData.departure_date,
      return_date: formData.return_date,
    }

    const response: CreateTravelResponse = await createTravelRequest(travelData)

    if (response.success) {
      router.push('/users/travel-requests')
    }
  } catch (error: any) {
    const apiError = error as ApiError
    console.error('Erro ao criar solicitação:', apiError)

    if (apiError.errors && Object.keys(apiError.errors).length > 0) {
      Object.keys(apiError.errors).forEach(field => {
        if (field in formData) {
          errors[field as keyof typeof formData] = apiError.errors![field][0]
        }
      })
    } else if (apiError.message) {
      errors.general = apiError.message
    } else {
      errors.general = 'Erro ao criar solicitação. Tente novamente.'
    }
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.push('/users/travel-requests')
}

const handleBlur = (field: string) => {
  validateField(field)
}
</script>

<style scoped>
.page {
  background: #ffffff;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px 16px;
}

.card {
  width: 100%;
  max-width: 480px;
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
}

.header {
  padding: 28px 28px 16px;
  text-align: center;
}

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.brand-icon {
  width: 24px;
  height: 24px;
  color: var(--color-primary);
}

.brand-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.title {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin-top: 8px;
}

.subtitle {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.form {
  padding: 0 28px 28px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.error-general {
  color: #dc2626;
  font-size: 14px;
  text-align: center;
  margin-top: 16px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
}

/* Destination search styles */
.destination-search {
  position: relative;
  margin-bottom: 14px;
}

.search-input-wrapper {
  position: relative;
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  margin-top: 4px;
}

.search-result-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.15s ease;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background-color: #f9fafb;
}

.search-loading {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-primary);
  z-index: 10;
}

.search-loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px 16px;
  color: #6b7280;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

.spinner-circle {
  stroke-dasharray: 62.83;
  stroke-dashoffset: 62.83;
  animation: dash 1.5s ease-in-out infinite;
}

.loading-text {
  font-size: 14px;
  color: #6b7280;
}

.no-results {
  padding: 24px 16px;
  text-align: center;
}

.no-results-text {
  font-size: 14px;
  color: #6b7280;
}

.result-name {
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.result-details {
  font-size: 12px;
  color: #6b7280;
}

/* Destination details styles */
.destination-details {
  background: #f9fafb;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.details-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
}

.details-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-label {
  font-weight: 500;
  color: #374151;
  min-width: 80px;
}

.detail-value {
  color: #111827;
  font-weight: 500;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dashoffset: 62.83;
  }
  50% {
    stroke-dashoffset: 15.71;
  }
  100% {
    stroke-dashoffset: 62.83;
  }
}
</style>
