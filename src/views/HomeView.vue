<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { BookOpenIcon, AcademicCapIcon, LanguageIcon } from '@heroicons/vue/24/solid'

// Carousel State
const currentImageIndex = ref(0)
const images = [
  'https://images.unsplash.com/photo-1542051841857-5f90071e7989?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Tokyo Street
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Mt Fuji
  'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Sakura
]

let carouselInterval = null

const startCarousel = () => {
  carouselInterval = setInterval(() => {
    currentImageIndex.value = (currentImageIndex.value + 1) % images.length
  }, 3000)
}

onMounted(() => {
  startCarousel()
})

onUnmounted(() => {
  if (carouselInterval) clearInterval(carouselInterval)
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Hero Banner with Carousel -->
    <div class="relative h-screen flex items-center justify-center overflow-hidden">
      <!-- Background Carousel -->
      <div class="absolute inset-0 z-0 bg-gray-900">
        <transition-group name="fade">
          <div
            v-for="(img, index) in images"
            :key="img"
            v-show="currentImageIndex === index"
            class="absolute inset-0"
          >
            <img :src="img" alt="Background" class="w-full h-full object-cover opacity-80" />
            <div
              class="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60"
            ></div>
          </div>
        </transition-group>
      </div>

      <!-- Content -->
      <div class="relative z-10 text-center text-white px-4 max-w-4xl mx-auto mt-16">
        <h1
          class="text-6xl md:text-8xl font-black mb-6 tracking-tight drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-indigo-200"
        >
          <ruby>
            日
            <rt>に</rt>
          </ruby>
          <ruby>
            本
            <rt>ほん</rt>
          </ruby>
          <ruby>
            語
            <rt>ご</rt>
          </ruby>
          <ruby
            >学
            <rt>がく</rt>
          </ruby>
          <ruby
            >習
            <rt>しゅう</rt>
          </ruby>
        </h1>
        <p
          class="text-xl md:text-3xl mb-12 font-light drop-shadow-lg text-white/90 max-w-4xl mx-auto leading-relaxed"
        >
          書山に道ありて勤を径とし、学海に涯なして苦を舟とす。
        </p>
        <RouterLink
          to="/books"
          class="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-indigo-600 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-700 hover:shadow-[0_0_30px_-5px_rgba(79,70,229,0.5)] transform hover:-translate-y-1"
        >
          <span>今すぐ学習を始めよう</span>
          <svg
            class="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            ></path>
          </svg>
          <div
            class="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 animate-pulse-slow"
          ></div>
        </RouterLink>
      </div>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce text-white/50">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          ></path>
        </svg>
      </div>
    </div>

    <!-- Introduction Section -->
    <section class="py-24 bg-white relative overflow-hidden">
      <!-- Decorative blobs -->
      <div
        class="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50 pointer-events-none"
      ></div>
      <div
        class="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-200 rounded-full blur-3xl opacity-50 pointer-events-none"
      ></div>

      <div class="max-w-7xl mx-auto px-6 relative z-10">
        <h2 class="text-4xl font-bold text-center text-gray-900 mb-16">
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-indigo-500"
            >Explore Our Features</span
          >
        </h2>

        <div class="grid md:grid-cols-3 gap-10">
          <!-- Card 1: Books -->
          <div
            class="group relative p-8 rounded-3xl bg-white border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
          >
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"
            ></div>

            <div class="relative z-10">
              <div
                class="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-indigo-200 group-hover:rotate-6 transition-transform"
              >
                <BookOpenIcon class="w-8 h-8" />
              </div>
              <h3 class="text-2xl font-bold mb-3 text-gray-800">Curated Books</h3>
              <p class="text-lg text-gray-600 leading-relaxed group-hover:text-gray-900">
                Access a wide range of Japanese learning materials organized by level, from N5 to
                N1.
              </p>
            </div>
          </div>

          <!-- Card 2: Courses -->
          <div
            class="group relative p-8 rounded-3xl bg-white border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
          >
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"
            ></div>

            <div class="relative z-10">
              <div
                class="w-16 h-16 rounded-2xl bg-indigo-500 text-white flex items-center justify-center mb-6 shadow-lg shadow-indigo-200 group-hover:-rotate-6 transition-transform"
              >
                <AcademicCapIcon class="w-8 h-8" />
              </div>
              <h3 class="text-2xl font-bold mb-3 text-gray-800">Structured Courses</h3>
              <p class="text-lg text-gray-600 leading-relaxed group-hover:text-gray-900">
                Follow step-by-step courses designed to guide you from basics to advanced fluency.
              </p>
            </div>
          </div>

          <!-- Card 3: Vocabulary -->
          <div
            class="group relative p-8 rounded-3xl bg-white border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
          >
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-50 to-pink-100 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"
            ></div>

            <div class="relative z-10">
              <div
                class="w-16 h-16 rounded-2xl bg-pink-500 text-white flex items-center justify-center mb-6 shadow-lg shadow-pink-200 group-hover:scale-110 transition-transform"
              >
                <LanguageIcon class="w-8 h-8" />
              </div>
              <h3 class="text-2xl font-bold mb-3 text-gray-800">Vocabulary Mastery</h3>
              <p class="text-lg text-gray-600 leading-relaxed group-hover:text-gray-900">
                Master words with built-in Furigana support, audio pronunciation, and context.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1.5s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
