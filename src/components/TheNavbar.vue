<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  ClipboardDocumentListIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/vue/24/outline'

const route = useRoute()
const isScrolled = ref(false)
const isUserDropdownOpen = ref(false)
let dropdownTimeout = null
let authStore = useAuthStore()
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

const showDropdown = () => {
  if (dropdownTimeout) clearTimeout(dropdownTimeout)
  isUserDropdownOpen.value = true
}

const hideDropdown = () => {
  dropdownTimeout = setTimeout(() => {
    isUserDropdownOpen.value = false
  }, 100)
}

const navClasses = computed(() => {
  const isHome = route.name === undefined || route.name === 'home' || route.path === '/'
  const isDetail = route.name === 'course-detail'

  // Base classes for transition
  let classes = 'transition-all duration-300 ease-in-out '

  if (isScrolled.value) {
    // Scrolled: White bg, border bottom, dark text (Flat Style)
    return classes + 'bg-white border-b border-gray-100 text-gray-800 py-3'
  } else {
    // Top State
    if (isHome) {
      // Home Top: Transparent, White Text
      return classes + 'bg-transparent text-white py-4'
    } else if (isDetail) {
      // Detail Top: Transparent, Dark Text (per requirement)
      return classes + 'bg-transparent text-gray-800 py-4'
    } else {
      // Others Top (Books etc): Transparent/White, Dark Text
      return classes + 'bg-white/0 text-gray-800 py-4'
    }
  }
})

// Dynamic Text Color for hover based on background
const linkHoverClass = computed(() => 'hover:text-indigo-600 transition-colors duration-200')
const iconHoverClass = computed(
  () => 'hover:text-indigo-600 hover:scale-105 transition-all duration-200',
)

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <nav class="fixed top-0 left-0 w-full z-50 px-6 font-sans" :class="navClasses">
    <div class="max-w-7xl mx-auto flex justify-between items-center h-full">
      <!-- Left Section: Link Container -->
      <div class="flex items-center gap-6">
        <!-- Main Logo (Restored) -->
        <RouterLink
          to="/"
          class="group flex items-center gap-2 mr-2 hover:opacity-90 transition-opacity"
        >
          <div class="relative flex flex-col items-center">
            <span
              class="text-3xl font-black tracking-tighter bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 bg-clip-text text-transparent pb-1 block"
            >
              HJPL
            </span>
            <svg
              class="absolute -bottom-2 w-12 h-3 text-indigo-600 opacity-80"
              viewBox="0 0 100 25"
              preserveAspectRatio="none"
            >
              <path
                d="M0 5 Q50 25 100 5"
                stroke="currentColor"
                stroke-width="10"
                fill="none"
                stroke-linecap="round"
              />
            </svg>
          </div>
        </RouterLink>

        <RouterLink to="/" class="text-lg font-medium tracking-wide" :class="linkHoverClass">
          ホームページ
        </RouterLink>
        <RouterLink to="/books" class="text-lg font-medium tracking-wide" :class="linkHoverClass">
          ブックシェルフ
        </RouterLink>
      </div>

      <!-- Right Section: Icons & User Area -->
      <div class="flex items-center gap-4 mr-4">
        <!-- Log Icon (History) -->
        <button title="Study Log" class="p-1" :class="iconHoverClass">
          <ClipboardDocumentListIcon class="h-5 w-5 stroke-2" />
        </button>

        <!-- GitHub Icon -->
        <a
          href="https://github.com"
          target="_blank"
          title="GitHub"
          class="p-1"
          :class="iconHoverClass"
        >
          <svg class="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.03.66-3.72-1.455-3.72-1.455-.54-1.38-1.335-1.755-1.335-1.755-1.095-.75.075-.735.075-.735 1.2.09 1.83 1.245 1.83 1.245 1.08 1.86 2.805 1.32 3.495 1.005.105-.78.42-1.32.765-1.62-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.225 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405 1.02 0 2.04.135 3 .405 2.28-1.545 3.3-1.23 3.3-1.23.66 1.695.255 2.925.135 3.225.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
            />
          </svg>
        </a>

        <!-- User Area (Avatar + Name + Dropdown) -->
        <div class="relative group ml-2" @mouseenter="showDropdown" @mouseleave="hideDropdown">
          <div
            class="flex items-center gap-2 cursor-pointer transition-transform duration-200 hover:scale-105"
          >
            <!-- Avatar -->
            <img
              src="https://placehold.co/100x100/indigo/white?text=User"
              alt="Avatar"
              class="w-8 h-8 rounded-full border border-gray-200 object-cover"
            />
            <!-- Username (Hidden on Mobile) -->
            <span class="text-sm font-medium hidden md:block">
              {{ authStore.userInfo?.username }}
            </span>
          </div>

          <!-- Dropdown Menu -->
          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-2"
          >
            <div
              v-show="isUserDropdownOpen"
              class="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)] py-1 overflow-hidden z-[9999]"
            >
              <button
                class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
              >
                <UserCircleIcon class="h-4 w-4" />
                Personal Center
              </button>

              <button
                class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-500 transition-colors flex items-center gap-2 border-t border-gray-50"
              >
                <ArrowLeftOnRectangleIcon class="h-4 w-4" />
                Logout
              </button>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Ensure icons inherit color correctly */
button,
a {
  outline: none;
}
</style>
