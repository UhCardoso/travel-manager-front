import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/auth/LoginView.vue'
import AdminLoginView from '../views/admin/AdminLoginView.vue'

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
  next()
})

export default router
