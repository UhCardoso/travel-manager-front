<template>
  <div class="field">
    <label v-if="label" :for="id" class="label">{{ label }}</label>
    <input
      :id="id"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :required="required"
      :disabled="disabled"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${id}-error` : undefined"
      class="input"
      :class="{ 'input--error': error, 'input--disabled': disabled }"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
    />
    <p v-if="error" :id="`${id}-error`" class="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  id: string
  label?: string
  type?: string
  placeholder?: string
  autocomplete?: string
  required?: boolean
  disabled?: boolean
  error?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
})

defineEmits<Emits>()
</script>

<style scoped>
.field {
  margin-bottom: 14px;
}

.field:last-child {
  margin-bottom: 0;
}

.label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.input {
  width: 100%;
  font-size: 16px;
  color: #111827;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 14px;
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.input::placeholder {
  color: #9ca3af;
}

.input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
}

.input--error {
  border-color: #dc2626;
}

.input--error:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15);
}

.input--disabled {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.error {
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
}
</style>
