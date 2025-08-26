<template>
  <ConfirmationModal
    :show="show"
    title="Detalhes da Solicitação"
    confirm-text="Fechar"
    cancel-text=""
    :show-close-button="true"
    @confirm="$emit('close')"
    @close="$emit('close')"
  >
    <template #body>
      <div v-if="travelRequest" class="details-content">
        <div class="detail-section">
          <h4 class="section-title">Informações Gerais</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">ID do Pedido:</span>
              <span class="detail-value">#{{ travelRequest.id.toString().padStart(8, '0') }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Status:</span>
              <span class="status-badge" :class="getStatusClass(travelRequest.status)">
                {{ getStatusText(travelRequest.status) }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Data de Ida:</span>
              <span class="detail-value">{{ formatDate(travelRequest.departure_date) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Data de Volta:</span>
              <span class="detail-value">{{ formatDate(travelRequest.return_date) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Data da Solicitação:</span>
              <span class="detail-value">{{ formatDate(travelRequest.created_at) }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="section-title">Destino</h4>
          <div class="detail-item">
            <span class="detail-label">Nome:</span>
            <span class="detail-value">{{ travelRequest.name }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="section-title">Detalhes do Destino</h4>
          <div class="detail-grid">
            <div v-if="travelRequest.country" class="detail-item">
              <span class="detail-label">País:</span>
              <span class="detail-value">{{ travelRequest.country }}</span>
            </div>
            <div v-if="travelRequest.town" class="detail-item">
              <span class="detail-label">Cidade:</span>
              <span class="detail-value">{{ travelRequest.town }}</span>
            </div>
            <div v-if="travelRequest.state" class="detail-item">
              <span class="detail-label">Estado/Província:</span>
              <span class="detail-value">{{ travelRequest.state }}</span>
            </div>
            <div v-if="travelRequest.region" class="detail-item">
              <span class="detail-label">Região:</span>
              <span class="detail-value">{{ travelRequest.region }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="loading" class="loading-details">
        <div class="loading-spinner"></div>
        <p>Carregando detalhes...</p>
      </div>

      <div v-else-if="error" class="error-details">
        <p class="error-message">{{ error }}</p>
        <BaseButton variant="outline" @click="$emit('retry')">Tentar Novamente</BaseButton>
      </div>
    </template>

    <template #footer>
      <BaseButton variant="primary" @click="$emit('close')">Fechar</BaseButton>
    </template>
  </ConfirmationModal>
</template>

<script setup lang="ts">
import { BaseButton, ConfirmationModal } from '@/components/ui'
import type { TravelRequest } from '@/api/travelApiService'

interface Props {
  show: boolean
  travelRequest: TravelRequest | null
  loading: boolean
  error: string | null
}

interface Emits {
  (e: 'close'): void
  (e: 'retry'): void
}

defineProps<Props>()
defineEmits<Emits>()

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
</script>

<style scoped>
/* Details modal styles */
.details-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.detail-section {
  border-bottom: 1px solid var(--color-border-light);
  padding-bottom: var(--spacing-lg);
}

.detail-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.section-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.detail-label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  min-width: 120px;
  flex-shrink: 0;
}

.detail-value {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.loading-details {
  text-align: center;
  padding: var(--spacing-2xl) var(--spacing-xl);
}

.loading-details .loading-spinner {
  width: 32px;
  height: 32px;
  margin: 0 auto var(--spacing-lg);
}

.loading-details p {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
  margin: 0;
}

.error-details {
  text-align: center;
  padding: var(--spacing-2xl) var(--spacing-xl);
}

.error-details .error-message {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-lg);
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

/* Loading spinner */
.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border-primary);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
