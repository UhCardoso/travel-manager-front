<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="button"
    :class="[`button--${variant}`, { 'button--loading': loading, 'button--full-width': fullWidth }]"
    @click="$emit('click', $event)"
  >
    <svg v-if="loading" class="button__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" opacity="0.6" d="M12 2a10 10 0 100 20v-2a8 8 0 110-16V2z" />
    </svg>
    <svg v-else-if="icon" class="button__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path :d="icon" fill="currentColor" />
    </svg>
    <span v-if="$slots.default || text" class="button__text">
      <slot>{{ text }}</slot>
    </span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  text?: string
  icon?: string
}

interface Emits {
  (e: 'click', event: MouseEvent): void
}

withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  fullWidth: false,
})

defineEmits<Emits>()
</script>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition:
    filter 0.15s ease,
    opacity 0.15s ease,
    transform 0.1s ease;
  user-select: none;
}

.button:hover:not(:disabled) {
  filter: brightness(0.96);
  transform: translateY(-1px);
}

.button:active:not(:disabled) {
  transform: translateY(0);
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.button--full-width {
  width: 100%;
}

.button--loading {
  cursor: wait;
}

.button--primary {
  background: var(--color-primary);
  color: #ffffff;
  border-color: var(--color-primary);
}

.button--secondary {
  background: #f3f4f6;
  color: #374151;
  border-color: #d1d5db;
}

.button--outline {
  background: transparent;
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.button--outline:hover:not(:disabled) {
  background: var(--color-primary);
  color: #ffffff;
}

.button--ghost {
  background: transparent;
  color: #6b7280;
  border-color: transparent;
}

.button--ghost:hover:not(:disabled) {
  background: #f3f4f6;
  color: #374151;
}

.button--sm {
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 8px;
}

.button--lg {
  padding: 16px 20px;
  font-size: 18px;
  border-radius: 14px;
}

.button__icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.button__text {
  line-height: 1;
}
</style>
