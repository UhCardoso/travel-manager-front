import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import AdminLoginView from '../views/admin/AdminLoginView.vue'
import TravelRequests from '../views/users/TravelRequests.vue'
import CreateTravelRequest from '../views/users/CreateTravelRequest.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: LoginView,
      meta: { title: 'Login de Usuário' },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { title: 'Registro de Usuário' },
    },
    {
      path: '/admin',
      name: 'admin-login',
      component: AdminLoginView,
      meta: { title: 'Login de Administrador' },
    },
    {
      path: '/users/travel-requests',
      name: 'travel-requests',
      component: TravelRequests,
      meta: { title: 'Solicitações de Viagem' },
    },
    {
      path: '/users/create-travel-request',
      name: 'create-travel-request',
      component: CreateTravelRequest,
      meta: { title: 'Nova Solicitação de Viagem' },
    },
    // 404 Route
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/',
    },
  ],
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - Travel Manager`
  }

  const hasToken = localStorage.getItem('authToken')

  // If trying to access login/admin-login/register and already logged in, redirect to travel-requests
  if ((to.name === 'home' || to.name === 'admin-login' || to.name === 'register') && hasToken) {
    next('/users/travel-requests')
    return
  }

  // If trying to access travel-requests or create-travel-request without being logged in, redirect to login
  if ((to.name === 'travel-requests' || to.name === 'create-travel-request') && !hasToken) {
    next('/')
    return
  }

  next()
})

export default router
