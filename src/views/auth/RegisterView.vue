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

        <h2 class="title">Crie sua conta</h2>
        <p class="subtitle">Registre-se para gerenciar suas viagens corporativas</p>
      </header>

      <form class="form" @submit.prevent="handleRegister" novalidate>
        <BaseInput
          id="name"
          v-model="formData.name"
          label="Nome completo"
          type="text"
          placeholder="Seu nome e sobrenome"
          autocomplete="name"
          required
          :error="errors.name"
          @blur="handleBlur('name')"
        />

        <BaseInput
          id="email"
          v-model="formData.email"
          label="Email"
          type="email"
          placeholder="seu@email.com"
          autocomplete="email"
          required
          :error="errors.email"
          @blur="handleBlur('email')"
        />

        <BaseInput
          id="password"
          v-model="formData.password"
          label="Senha"
          type="password"
          placeholder="••••••••"
          autocomplete="new-password"
          required
          :error="errors.password"
          @blur="handleBlur('password')"
        />

        <BaseInput
          id="password_confirmation"
          v-model="formData.password_confirmation"
          label="Confirmar senha"
          type="password"
          placeholder="••••••••"
          autocomplete="new-password"
          required
          :error="errors.password_confirmation"
          @blur="handleBlur('password_confirmation')"
        />

        <BaseButton type="submit" variant="primary" :loading="loading" :full-width="true">
          {{ loading ? 'Criando conta...' : 'Criar conta' }}
        </BaseButton>

        <p v-if="errors.general" class="error-general">{{ errors.general }}</p>
      </form>

      <footer class="footer">
        <div class="divider"><span>ou</span></div>
        <p class="footnote">
          Já tem uma conta?
          <router-link to="/" class="link-strong">Faça login aqui</router-link>
        </p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userRegisterSchema, validateForm, type UserRegisterForm } from '@/utils/validation'
import { BaseInput, BaseButton } from '@/components/ui'
import { userRegister, type RegisterResponse, type ApiError } from '@/api/userApiService'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const formData = reactive<UserRegisterForm>({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})
const loading = ref(false)
const errors = reactive<Record<string, string>>({})

// Check if already logged in when loading the page
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/users/travel-requests')
  }
})

// Validate form fields
const validateField = async (field: keyof UserRegisterForm) => {
  try {
    await userRegisterSchema.validateAt(field, formData)
    delete errors[field]
  } catch (err: any) {
    errors[field] = err.message
  }
}

// Validate form data
const validateFormData = async () => {
  const result = await validateForm(userRegisterSchema, formData)
  if (!result.isValid) Object.assign(errors, result.errors)
  return result.isValid
}

// Handle register form submission
const handleRegister = async () => {
  Object.keys(errors).forEach(k => delete errors[k])
  const ok = await validateFormData()
  if (!ok) return

  loading.value = true
  try {
    const response: RegisterResponse = await userRegister({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.password_confirmation,
    })

    if (response.success) {
      authStore.setAuth(response.data.token, response.data.user)
      router.push('/users/travel-requests')
    }
  } catch (error: any) {
    const apiError = error as ApiError
    console.log('Erro capturado no RegisterView:', apiError)

    if (apiError.errors && Object.keys(apiError.errors).length > 0) {
      Object.keys(apiError.errors).forEach(field => {
        if (field in formData) {
          errors[field as keyof UserRegisterForm] = apiError.errors![field][0]
        }
      })
    } else if (apiError.message) {
      errors.general = apiError.message
    } else {
      errors.general = 'Erro no registro. Verifique os dados e tente novamente.'
    }
  } finally {
    loading.value = false
  }
}

const handleBlur = (field: keyof UserRegisterForm) => validateField(field)
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
  max-width: 420px;
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

.link-strong {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
}

.link-strong:hover {
  text-decoration: underline;
}

.footer {
  padding: 0 28px 28px;
  text-align: center;
}

.footnote {
  color: #374151;
  font-size: 14px;
}

.divider {
  position: relative;
  height: 1px;
  background: var(--color-border);
  margin: 12px 0 10px;
}

.divider > span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  padding: 0 8px;
  font-size: 13px;
  color: #6b7280;
}
</style>
