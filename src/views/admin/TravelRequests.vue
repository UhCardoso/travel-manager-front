<template>
  <div class="travel-requests">
    <header class="header">
      <h1>Solicitações de Viagem - Administração</h1>
      <div class="header-actions">
        <BaseButton variant="outline" @click="handleLogout" :loading="loading">Sair</BaseButton>
      </div>
    </header>

    <main class="content">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Carregando solicitações...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <p class="error-message">{{ error }}</p>
        <BaseButton variant="primary" @click="() => loadTravelRequests()"
          >Tentar Novamente</BaseButton
        >
      </div>

      <div v-else-if="travelRequests.length === 0" class="empty-state">
        <p>Nenhuma solicitação de viagem encontrada.</p>
      </div>

      <div v-else class="table-container">
        <table class="travel-table">
          <thead>
            <tr>
              <th>ID do Pedido</th>
              <th>Usuário</th>
              <th>Email</th>
              <th>Destino</th>
              <th>País</th>
              <th>Cidade</th>
              <th>Data de Ida</th>
              <th>Data de Volta</th>
              <th>Status</th>
              <th>Data da Solicitação</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="request in travelRequests"
              :key="request.id"
              class="table-row"
              @click="handleRowClick(request)"
            >
              <td>#{{ request.id.toString().padStart(8, '0') }}</td>
              <td>{{ request.user?.name || 'N/A' }}</td>
              <td>{{ request.user?.email || 'N/A' }}</td>
              <td>{{ request.name }}</td>
              <td>{{ request.country }}</td>
              <td>{{ request.town }}</td>
              <td>{{ formatDate(request.departure_date) }}</td>
              <td>{{ formatDate(request.return_date) }}</td>
              <td>
                <span class="status-badge" :class="getStatusClass(request.status)">
                  {{ getStatusText(request.status) }}
                </span>
              </td>
              <td>{{ formatDate(request.created_at) }}</td>
              <td @click.stop>
                <div class="status-update-container">
                  <BaseButton
                    variant="outline"
                    size="sm"
                    :disabled="request.status === 'approved' || request.status === 'cancelled'"
                    :loading="updatingRequestId === request.id"
                    @click="toggleStatusDropdown(request.id)"
                    class="update-button"
                  >
                    Atualizar Status
                  </BaseButton>

                  <div v-if="openStatusDropdown === request.id" class="status-dropdown">
                    <div
                      v-for="status in availableStatuses"
                      :key="status.value"
                      class="status-option"
                      @click="updateRequestStatus(request.id, status)"
                    >
                      {{ status.label }}
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="paginationMeta" class="pagination-container">
          <div class="pagination-info">
            <span>
              Mostrando {{ paginationMeta.from }} a {{ paginationMeta.to }} de
              {{ paginationMeta.total }} resultados
            </span>
          </div>

          <div class="pagination-controls">
            <BaseButton
              variant="outline"
              size="sm"
              :disabled="!paginationLinks?.prev"
              @click="goToPage(paginationMeta!.current_page - 1)"
            >
              Anterior
            </BaseButton>

            <div class="page-numbers">
              <span
                v-for="page in getVisiblePages()"
                :key="page"
                :class="['page-number', { active: page === paginationMeta!.current_page }]"
                @click="goToPage(page)"
              >
                {{ page }}
              </span>
            </div>

            <BaseButton
              variant="outline"
              size="sm"
              :disabled="!paginationLinks?.next"
              @click="goToPage(paginationMeta!.current_page + 1)"
            >
              Próxima
            </BaseButton>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal de Detalhes -->
    <TravelRequestDetailsModal
      :show="showDetailsModal"
      :travel-request="selectedRequestDetails"
      :loading="loadingDetails"
      :error="detailsError"
      @close="closeDetailsModal"
      @retry="loadRequestDetails"
    />

    <!-- Modal de Confirmação de Status -->
    <ConfirmationModal
      :show="showStatusModal"
      title="Confirmar Alteração de Status"
      :loading="updatingRequestId === selectedStatusRequest?.id"
      confirm-variant="outline"
      confirm-text="Sim, Alterar"
      cancel-text="Não, Cancelar"
      @confirm="confirmStatusUpdate"
      @cancel="closeStatusModal"
      @close="closeStatusModal"
    >
      <template #body>
        <p>
          Tem certeza que deseja alterar o status da solicitação
          <strong>{{ selectedStatusRequest?.name }}</strong> para
          <strong>{{ getStatusText(selectedStatus?.value || '') }}</strong
          >?
        </p>
        <p class="warning-text">Esta ação não pode ser desfeita.</p>
      </template>

      <template #footer>
        <BaseButton variant="outline" @click="closeStatusModal">Não, Cancelar</BaseButton>
        <BaseButton
          variant="primary"
          :loading="updatingRequestId === selectedStatusRequest?.id"
          @click="confirmStatusUpdate"
        >
          Sim, Alterar
        </BaseButton>
      </template>
    </ConfirmationModal>

    <!-- Notificação -->
    <Notification
      :show="showNotification"
      :message="notificationMessage"
      :type="notificationType"
      @close="hideNotification"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  BaseButton,
  Notification,
  TravelRequestDetailsModal,
  ConfirmationModal,
} from '@/components/ui'
import { userLogout } from '@/api/userApiService'
import { getTravelRequestDetails, type TravelRequest } from '@/api/travelApiService'
import {
  getAllTravelRequests,
  updateTravelRequestStatus,
  type AdminTravelRequest,
} from '@/api/adminApiService'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const travelRequests = ref<AdminTravelRequest[]>([])
const error = ref<string | null>(null)

// Details modal states
const showDetailsModal = ref(false)
const selectedRequestDetails = ref<AdminTravelRequest | null>(null)
const loadingDetails = ref(false)
const detailsError = ref<string | null>(null)

// Notification states
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref<'success' | 'error'>('success')

// Pagination states
const paginationMeta = ref<{
  current_page: number
  from: number
  last_page: number
  per_page: number
  to: number
  total: number
} | null>(null)

const paginationLinks = ref<{
  first: string | null
  last: string | null
  next: string | null
  prev: string | null
} | null>(null)

// Updating request state
const updatingRequestId = ref<number | null>(null)
const openStatusDropdown = ref<number | null>(null)

// Status confirmation modal states
const showStatusModal = ref(false)
const selectedStatusRequest = ref<AdminTravelRequest | null>(null)
const selectedStatus = ref<{ value: string; label: string } | null>(null)

// Available statuses for update
const availableStatuses = [
  { value: 'approved', label: 'Aprovar' },
  { value: 'cancelled', label: 'Cancelar' },
]

// Check if logged in when loading the page
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/')
  } else {
    loadTravelRequests()
  }

  // Add click outside listener to close dropdown
  document.addEventListener('click', handleClickOutside)
})

// Cleanup event listener
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Handle click outside dropdown
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.status-update-container')) {
    openStatusDropdown.value = null
  }
}

// Load travel requests from admin API
const loadTravelRequests = async (page: number = 1) => {
  loading.value = true
  error.value = null

  try {
    const response = await getAllTravelRequests(page)

    if (response.success) {
      travelRequests.value = response.data.data
      paginationMeta.value = response.data.meta
      paginationLinks.value = response.data.links
    } else {
      error.value = response.message || 'Erro ao carregar solicitações'
    }
  } catch (err: any) {
    console.error('Erro ao carregar solicitações:', err)
    error.value = err.message || 'Erro ao carregar solicitações'
  } finally {
    loading.value = false
  }
}

// Handle row click to show details
const handleRowClick = async (request: AdminTravelRequest) => {
  selectedRequestDetails.value = null
  showDetailsModal.value = true
  detailsError.value = null

  try {
    loadingDetails.value = true
    const response = await getTravelRequestDetails(request.id)
    if (response.success) {
      selectedRequestDetails.value = response.data as AdminTravelRequest
    } else {
      detailsError.value = response.message || 'Erro ao carregar detalhes'
    }
  } catch (err: any) {
    console.error('Erro ao carregar detalhes:', err)
    detailsError.value = err.message || 'Erro ao carregar detalhes'
  } finally {
    loadingDetails.value = false
  }
}

// Load request details (for retry)
const loadRequestDetails = async () => {
  if (!selectedRequestDetails.value) return

  try {
    loadingDetails.value = true
    detailsError.value = null
    const response = await getTravelRequestDetails(selectedRequestDetails.value.id)
    if (response.success) {
      selectedRequestDetails.value = response.data as AdminTravelRequest
    } else {
      detailsError.value = response.message || 'Erro ao carregar detalhes'
    }
  } catch (err: any) {
    console.error('Erro ao carregar detalhes:', err)
    detailsError.value = err.message || 'Erro ao carregar detalhes'
  } finally {
    loadingDetails.value = false
  }
}

// Close details modal
const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedRequestDetails.value = null
}

// Toggle status dropdown
const toggleStatusDropdown = (requestId: number) => {
  if (openStatusDropdown.value === requestId) {
    openStatusDropdown.value = null
  } else {
    openStatusDropdown.value = requestId
  }
}

// Show status confirmation modal
const updateRequestStatus = (requestId: number, newStatus: { value: string; label: string }) => {
  const request = travelRequests.value.find(r => r.id === requestId)
  if (request) {
    selectedStatusRequest.value = request
    selectedStatus.value = newStatus
    showStatusModal.value = true
    openStatusDropdown.value = null
  }
}

// Confirm status update
const confirmStatusUpdate = async () => {
  if (!selectedStatusRequest.value || !selectedStatus.value) return

  const requestId = selectedStatusRequest.value.id
  const newStatus = selectedStatus.value.value

  updatingRequestId.value = requestId

  try {
    const response = await updateTravelRequestStatus(requestId, newStatus)

    if (response.success) {
      // Update the request in the list
      const index = travelRequests.value.findIndex(r => r.id === requestId)
      if (index !== -1) {
        travelRequests.value[index] = response.data
      }

      showNotification.value = true
      notificationMessage.value = 'Status da solicitação atualizado com sucesso!'
      notificationType.value = 'success'

      closeStatusModal()
    } else {
      showNotification.value = true
      notificationMessage.value = response.message || 'Erro ao atualizar status'
      notificationType.value = 'error'
    }
  } catch (err: any) {
    console.error('Erro ao atualizar status:', err)
    showNotification.value = true
    notificationMessage.value = err.message || 'Erro ao atualizar status'
    notificationType.value = 'error'
  } finally {
    updatingRequestId.value = null
  }
}

// Close status modal
const closeStatusModal = () => {
  showStatusModal.value = false
  selectedStatusRequest.value = null
  selectedStatus.value = null
}

// Hide notification
const hideNotification = () => {
  showNotification.value = false
}

// Format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Get status text
const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    cancelled: 'Cancelado',
  }
  return statusMap[status] || status
}

// Get status class
const getStatusClass = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'status-pending',
    approved: 'status-approved',
    rejected: 'status-rejected',
    cancelled: 'status-cancelled',
  }
  return statusMap[status] || 'status-default'
}

// Logout function
const handleLogout = async () => {
  loading.value = true

  try {
    await userLogout()
    authStore.clearAuth()
    router.push('/')
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
    authStore.clearAuth()
    router.push('/')
  } finally {
    loading.value = false
  }
}

// Function to go to a specific page
const goToPage = async (page: number) => {
  if (!paginationMeta.value) return

  if (
    page < 1 ||
    page > paginationMeta.value.last_page ||
    page === paginationMeta.value.current_page
  ) {
    return
  }

  await loadTravelRequests(page)
}

// Function to get visible pages for pagination
const getVisiblePages = () => {
  const pages: number[] = []
  const totalPages = paginationMeta.value?.last_page || 0
  const currentPage = paginationMeta.value?.current_page || 0

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, 5)
    } else if (currentPage >= totalPages - 2) {
      pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    } else {
      pages.push(currentPage - 1, currentPage, currentPage + 1)
    }
  }
  return pages
}
</script>

<style scoped>
.travel-requests {
  min-height: 100vh;
  background: var(--color-bg-secondary);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2xl) var(--spacing-3xl);
  background: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border-primary);
  box-shadow: var(--shadow-md);
}

.header h1 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.content {
  padding: var(--spacing-4xl) var(--spacing-3xl);
}

/* Loading state */
.loading-state {
  text-align: center;
  padding: var(--spacing-5xl) var(--spacing-xl);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border-primary);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--spacing-xl);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-state p {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-base);
  margin: 0;
}

/* Error state */
.error-state {
  text-align: center;
  padding: var(--spacing-5xl) var(--spacing-xl);
}

.error-message {
  color: var(--color-error);
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-xl);
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: var(--spacing-5xl) var(--spacing-xl);
}

.empty-state p {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-xl);
}

/* Table styles */
.table-container {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.travel-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.travel-table th {
  background: var(--color-bg-secondary);
  padding: var(--spacing-lg) var(--spacing-xl);
  text-align: left;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border-primary);
}

.travel-table td {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--color-border-light);
  color: var(--color-text-primary);
}

.travel-table tr:last-child td {
  border-bottom: none;
}

.table-row:hover {
  background: var(--color-bg-secondary);
}

/* Status badges */
.status-badge {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-2xl);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-pending {
  background: var(--color-status-pending-bg);
  color: var(--color-status-pending-text);
}

.status-approved {
  background: var(--color-status-approved-bg);
  color: var(--color-status-approved-text);
}

.status-rejected {
  background: var(--color-status-rejected-bg);
  color: var(--color-status-rejected-text);
}

.status-cancelled {
  background: var(--color-status-cancelled-bg);
  color: var(--color-status-cancelled-text);
}

.status-default {
  background: var(--color-status-default-bg);
  color: var(--color-status-default-text);
}

/* Status update container and dropdown */
.status-update-container {
  position: relative;
}

.status-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  min-width: 160px;
  margin-top: var(--spacing-xs);
}

.status-option {
  padding: var(--spacing-md) var(--spacing-lg);
  cursor: pointer;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all 0.15s ease;
  text-align: center;
}

.status-option:hover {
  background: var(--color-bg-secondary);
}

.status-option:first-child {
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  color: var(--color-success);
}

.status-option:first-child:hover {
  background: var(--color-success);
  color: var(--color-bg-primary);
}

.status-option:last-child {
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  color: var(--color-danger);
}

.status-option:last-child:hover {
  background: var(--color-danger);
  color: var(--color-bg-primary);
}

/* Button styles */
.update-button {
  color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
}

.update-button:hover:not(:disabled) {
  background: var(--color-primary) !important;
  color: var(--color-bg-primary) !important;
}

.update-button:disabled {
  color: var(--color-text-muted) !important;
  border-color: var(--color-border-secondary) !important;
  background: var(--color-bg-tertiary) !important;
}

/* Make table rows clickable */
.table-row {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.table-row:hover {
  background: var(--color-bg-secondary);
}

/* Prevent button clicks from triggering row click */
.table-row td:last-child {
  cursor: default;
}

/* Pagination styles */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--color-border-light);
}

.pagination-info {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.pagination-controls {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.page-numbers {
  display: flex;
  gap: var(--spacing-xs);
}

.page-number {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.page-number:hover:not(.active) {
  background: var(--color-bg-secondary);
}

.page-number.active {
  background: var(--color-primary);
  color: var(--color-bg-primary);
  font-weight: var(--font-weight-bold);
}

/* Status confirmation button styles */
.confirm-status-button {
  color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
}

.confirm-status-button:hover:not(:disabled) {
  background: var(--color-primary) !important;
  color: var(--color-bg-primary) !important;
}
</style>
