<template>
  <Transition name="notification">
    <div v-if="show" class="notification" :class="type">
      <div class="notification-icon">
        <svg v-if="type === 'success'" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else-if="type === 'error'" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else-if="type === 'warning'" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <span class="notification-message">{{ message }}</span>

      <button v-if="showCloseButton" class="notification-close" @click="$emit('close')">
        &times;
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  showCloseButton?: boolean
  autoHide?: boolean
  duration?: number
}

interface Emits {
  (e: 'close'): void
}

withDefaults(defineProps<Props>(), {
  type: 'info',
  showCloseButton: true,
  autoHide: false,
  duration: 5000,
})

defineEmits<Emits>()
</script>

<style scoped>
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: var(--color-bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-xl);
  z-index: var(--z-notification);
  min-width: 300px;
  max-width: 400px;
  border-left: 4px solid;
}

.notification.success {
  border-left-color: var(--color-success);
}

.notification.error {
  border-left-color: var(--color-error);
}

.notification.warning {
  border-left-color: var(--color-warning);
}

.notification.info {
  border-left-color: var(--color-primary);
}

.notification-icon {
  width: 20px;
  height: 20px;
  margin-right: var(--spacing-md);
  flex-shrink: 0;
}

.notification.success .notification-icon {
  color: var(--color-success);
}

.notification.error .notification-icon {
  color: var(--color-error);
}

.notification.warning .notification-icon {
  color: var(--color-warning);
}

.notification.info .notification-icon {
  color: var(--color-primary);
}

.notification-message {
  flex-grow: 1;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.notification-close {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: 0 5px;
  margin-left: var(--spacing-md);
  border-radius: var(--radius-xs);
  transition: background-color 0.15s ease;
}

.notification-close:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

/* Transition animations */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-enter-to,
.notification-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>
