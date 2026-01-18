<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { QueueListIcon, LanguageIcon } from '@heroicons/vue/24/solid'
import { getBookList } from '@/services/bookService'
const fileSystemBaseUrl = import.meta.env.VITE_APP_FILE_SYSTEM_BASE_URL
const router = useRouter()

// Mock Data with Themed Cover Images (Placeholders)
const books = ref([
  {
    book_id: 1,
    book_name: 'みんなの日本語',
    book_info: '初级一',
    book_avartar: '/src/assets/bookCover.png',
    coursesCount: 25,
    vocabCount: 1200,
  },
])

const goToCourses = (bookId) => {
  // Add a slight delay for the click animation to play out visually if desired,
  // but usually instant navigation is preferred.
  // We'll rely on the CSS :active scale for immediate feedback.
  router.push(`/books/${bookId}/courses`)
}

// get book list when mounted
onMounted(() => {
  getBookList().then((res) => {
    books.value = res.data
  })
})
</script>

<template>
  <div class="min-h-screen pt-24 pb-12 px-6 bg-gray-50 perspective-wrapper">
    <div class="max-w-7xl mx-auto">
      <h2
        class="text-3xl font-bold text-gray-900 mb-12 border-l-4 border-indigo-600 pl-4 animate-fade-in-down"
      >
        ブックシェルフ
      </h2>

      <!-- Books Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-y-12 gap-x-8">
        <div
          v-for="(book, index) in books"
          :key="book.book_id"
          @click="goToCourses(book.book_id)"
          class="group relative perspective-container mx-auto w-full max-w-[230px] cursor-pointer animate-slide-up-fade"
          :style="{ animationDelay: `${index * 100}ms` }"
        >
          <!-- 3D Card Object -->
          <div
            class="book-card relative w-full aspect-[13/19] bg-white transition-all duration-400 ease-out transform-style-3d overflow-hidden"
          >
            <!-- Book Cover Image -->
            <img
              v-if="book.book_avartar"
              :src="fileSystemBaseUrl + book.book_avartar"
              :alt="book.book_name"
              class="w-full h-full object-cover"
            />
            <img
              v-else
              src="/src/assets/bookCover.png"
              :alt="book.book_name"
              class="w-full h-full object-cover"
            />

            <!-- Inner Shadow Overlay (Depth) -->
            <div class="absolute inset-0 pointer-events-none shadow-inner-book"></div>

            <!-- Light Sheen on Hover -->
            <div
              class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
            ></div>

            <!-- Info Overlay (Glass-like at bottom) -->
            <div
              class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-12 text-white translate-y-1 transition-transform duration-300 group-hover:translate-y-0"
            >
              <h3 class="font-bold text-lg leading-tight mb-1 line-clamp-2 drop-shadow-sm">
                {{ book.book_name }}
              </h3>
              <p class="text-xs text-gray-200 font-medium mb-3">{{ book.book_info }}</p>

              <div
                class="flex items-center justify-between text-xs text-gray-300 border-t border-white/20 pt-2 opacity-90 group-hover:opacity-100 transition-opacity"
              >
                <span class="flex items-center gap-1">
                  <QueueListIcon class="h-3 w-3" /> {{ book.coursesCount }}
                </span>
                <span class="flex items-center gap-1">
                  <LanguageIcon class="h-3 w-3" /> {{ book.vocabCount }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Perspective Container */
.perspective-container {
  perspective: 1000px;
}

/* Base Card Style */
.book-card {
  /* Default 3D State: Tilted slightly right and up */
  transform: rotateY(5deg) rotateX(2deg);
  border: 1px solid rgba(245, 245, 220, 0.4); /* Subtle beige border */
  border-radius: 4px 6px 6px 4px; /* Slight curve on right side */
  /* Note: Box shadow is handled by the wrapper/overlay to act as distinct elements,
     but request asks for shadow ON the card primarily.
     We separate outline shadow to .shadow-outer-book class below for better performance/layering.
  */
}

/* Inner Shadow for Depth Simulation */
.shadow-inner-book {
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
}

/* Base Shadow: Lighter and subtler as requested */
.book-card {
  box-shadow:
    0 4px 10px rgba(0, 0, 0, 0.08),
    inset 0 0 10px rgba(0, 0, 0, 0.1);
}

/* Hover State */
.group:hover .book-card {
  /* Lift, Straighten, Tilt Left */
  transform: rotateY(-3deg) rotateX(-1deg) translateY(-8px);
  /* Remove outer shadow completely on hover, keep inner shadow */
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
}

/* Active / Click State */
.group:active .book-card {
  transform: rotateY(-3deg) rotateX(-1deg) translateY(-6px) scale(0.98);
  transition-duration: 0.1s;
}

/* Entrance Animations */
@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(20px) rotateY(10deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotateY(5deg) rotateX(2deg); /* End at default state */
  }
}

.animate-slide-up-fade > .book-card {
  /* We act on the card, but the animation is often better on the container wrapper to avoid conflict with transform states.
     However, since our default state has a transform, we must be careful.
     Let's animate opacity/translate on the container, and keep rotation on the card.
  */
}

.animate-slide-up-fade {
  animation: slideUpFadeWrapper 0.6s ease-out backwards;
}

@keyframes slideUpFadeWrapper {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-down {
  animation: fadeInDown 0.8s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
