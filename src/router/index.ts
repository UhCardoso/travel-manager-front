import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/auth/LoginView.vue'
import AdminLoginView from '../views/admin/AdminLoginView.vue'
import TravelRequests from '../views/users/TravelRequests.vue'

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

  // If trying to access login/admin-login and already logged in, redirect to travel-requests
  if ((to.name === 'home' || to.name === 'admin-login') && hasToken) {
    next('/users/travel-requests')
    return
  }

  // Se tentar acessar travel-requests sem estar logado, redirecionar para login
  if (to.name === 'travel-requests' && !hasToken) {
    next('/')
    return
  }

  next()
})

export default router
