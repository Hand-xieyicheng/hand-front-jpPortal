<script setup>
import { RouterView } from 'vue-router'
import TheNavbar from './components/TheNavbar.vue'
</script>

<template>
  <div class="antialiased text-gray-800">
    <TheNavbar />
    
    <!-- Router View with Transition -->
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </div>
</template>
