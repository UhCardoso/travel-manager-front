<template>
  <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button v-if="showCloseButton" class="modal-close" @click="$emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <slot name="body">
          <p>{{ message }}</p>
        </slot>
      </div>

      <div class="modal-footer">
        <slot name="footer">
          <BaseButton variant="outline" @click="$emit('cancel')">
            {{ cancelText }}
          </BaseButton>
          <BaseButton :variant="confirmVariant" :loading="loading" @click="$emit('confirm')">
            {{ confirmText }}
          </BaseButton>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BaseButton } from '@/components/ui'

interface Props {
  show: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  loading?: boolean
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
}

interface Emits {
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Confirmação',
  message: 'Tem certeza que deseja continuar?',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  confirmVariant: 'primary',
  loading: false,
  showCloseButton: false,
  closeOnOverlayClick: true,
})

const emit = defineEmits<Emits>()

const handleOverlayClick = () => {
  if (props.closeOnOverlayClick) {
    emit('close')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-modal);
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 90%;
  max-width: 450px;
  max-height: 90%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideIn 0.2s ease-out;
}

.modal-header {
  padding: var(--spacing-xl) var(--spacing-2xl);
  border-bottom: 1px solid var(--color-border-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: background-color 0.15s ease;
}

.modal-close:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

.modal-body {
  padding: var(--spacing-2xl);
  overflow-y: auto;
  flex-grow: 1;
}

.modal-body p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  margin: 0 0 var(--spacing-md) 0;
  line-height: 1.5;
}

.modal-body p:last-child {
  margin-bottom: 0;
}

.modal-footer {
  padding: var(--spacing-lg) var(--spacing-2xl);
  border-top: 1px solid var(--color-border-primary);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
