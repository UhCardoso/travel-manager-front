<template>
  <div class="travel-requests">
    <header class="header">
      <h1>Solicitações de Viagem</h1>
      <BaseButton variant="outline" @click="handleLogout" :loading="loading"> Sair </BaseButton>
    </header>

    <main class="content">
      <p>Esta tela será implementada em breve.</p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { BaseButton } from '@/components/ui'
import { userLogout } from '@/api/userApiService'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

// Check if logged in when loading the page
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/')
  }
})

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
</script>

<style scoped>
.travel-requests {
  min-height: 100vh;
  background: #f9fafb;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.content {
  padding: 48px 32px;
  text-align: center;
}

.content p {
  color: #6b7280;
  font-size: 16px;
  margin: 0;
}
</style>
