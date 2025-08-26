<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full text-center">
      <div class="mb-8">
        <h1 class="text-9xl font-bold text-gray-300">404</h1>
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Página não encontrada</h2>
        <p class="text-gray-600 mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
      </div>

      <div class="space-y-4">
        <router-link
          to="/"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Voltar ao início
        </router-link>

        <div class="text-sm text-gray-500">
          <p>Ou tente uma dessas páginas:</p>
          <div class="mt-2 space-x-4">
            <router-link to="/about" class="text-blue-600 hover:text-blue-500"> Sobre </router-link>
            <router-link to="/login" class="text-blue-600 hover:text-blue-500"> Login </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
