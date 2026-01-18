<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getLessonListByBookId } from '@/services/bookService'
import {
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  PencilSquareIcon,
  InformationCircleIcon,
} from '@heroicons/vue/24/solid'

const route = useRoute()
const router = useRouter()
const book_id = route.params.bookId
// Mock Courses Data
const courses = ref([
  {
    lesson_id: 101,
    lesson_name: 'Lesson 1: Greetings & Introductions',
    book_id: '1',
    lesson_info: 'Learn basic greetings and how to introduce yourself.',
  },
])

const goToDetail = (courseId, section) => {
  router.push({
    name: 'course-detail',
    params: { courseId },
    hash: section ? `#${section}` : undefined,
  })
}

// get course list
onMounted(() => {
  getLessonListByBookId({ id: book_id }).then((res) => {
    courses.value = res.data
  })
})
</script>

<template>
  <div class="min-h-screen pt-24 pb-12 px-6 bg-gray-50">
    <div class="max-w-4xl mx-auto">
      <div class="mb-8">
        <button
          @click="router.back()"
          class="text-indigo-600 hover:text-indigo-800 font-medium flex items-center mb-4 transition-colors"
        >
          ← ブックシェルフに戻る
        </button>
        <h2 class="text-3xl font-bold text-gray-900 border-l-4 border-indigo-600 pl-4">
          コース一覧
        </h2>
      </div>

      <div class="space-y-4">
        <div
          v-for="course in courses"
          :key="course.lesson_id"
          class="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden transition-all duration-200 relative group"
        >
          <!-- Detail Icon (Top Right) -->
          <button
            @click="goToDetail(course.lesson_id)"
            class="absolute top-2 right-2 p-1 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-all z-10"
            lesson_name="Course Details"
          >
            <InformationCircleIcon class="h-5 w-5" />
          </button>

          <!-- Course Info Header -->
          <div class="p-6 border-b border-gray-50 bg-gray-50/50">
            <h3 class="text-lg font-bold text-gray-800 pr-6">
              {{ course.lesson_name }}
            </h3>
            <p class="text-gray-500 mt-1 text-sm">{{ course.lesson_info }}</p>
          </div>

          <!-- Action Buttons Grid -->
          <div class="grid grid-cols-3 divide-x divide-gray-100">
            <!-- Vocabulary Button -->
            <button
              @click="goToDetail(course.lesson_id, 'vocabulary')"
              class="p-3 hover:bg-indigo-50 transition-colors flex flex-col items-center justify-center group"
            >
              <BookOpenIcon
                class="h-6 w-6 mb-1 text-gray-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all"
              />
              <span class="text-xs font-medium text-gray-600 group-hover:text-indigo-600"
                >単語</span
              >
            </button>

            <!-- Conversation Button -->
            <button
              @click="goToDetail(course.lesson_id, 'conversation')"
              class="p-3 hover:bg-indigo-50 transition-colors flex flex-col items-center justify-center group"
            >
              <ChatBubbleLeftRightIcon
                class="h-6 w-6 mb-1 text-gray-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all"
              />
              <span class="text-xs font-medium text-gray-600 group-hover:text-indigo-600"
                >会話</span
              >
            </button>

            <!-- Example Sentences Button -->
            <button
              @click="goToDetail(course.lesson_id, 'examples')"
              class="p-3 hover:bg-indigo-50 transition-colors flex flex-col items-center justify-center group"
            >
              <PencilSquareIcon
                class="h-6 w-6 mb-1 text-gray-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all"
              />
              <span class="text-xs font-medium text-gray-600 group-hover:text-indigo-600"
                >例文</span
              >
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
