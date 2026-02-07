<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AudioPlayer from '../components/AudioPlayer.vue'
import { getWordsListByLessonId, getLessonByLessonId, getArticleByLessonId } from '@/services/bookService'
import {
  ArrowLeftIcon,
  SpeakerWaveIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
} from '@heroicons/vue/24/solid'

const fileSystemBaseUrl = import.meta.env.VITE_APP_FILE_SYSTEM_BASE_URL

const route = useRoute()
const router = useRouter()
const courseId = route.params.courseId

// Refs for sections
const sectionRefs = {
  vocabulary: ref(null),
  conversation: ref(null),
  examples: ref(null),
}

// Active Section State
const activeSection = ref('vocabulary')

// Mock Data
const courseTitle = ref('Lesson 1: Greetings & Introductions')

const vocabulary = ref([
  {
    word_id: 1,
    kanji: '私',
    katagana: 'わたし',
    romaji: 'watashi',
    meaning: 'I, me',
    audioTime: 0.5,
  },
  {
    word_id: 2,
    kanji: '学生',
    katagana: 'がくせい',
    romaji: 'gakusei',
    meaning: 'Student',
    audioTime: 2.5,
  },
  {
    word_id: 3,
    kanji: '先生',
    katagana: 'せんせい',
    romaji: 'sensei',
    meaning: 'Teacher',
    audioTime: 4.8,
  },
  {
    word_id: 4,
    kanji: '日本語',
    katagana: 'にほんご',
    romaji: 'nihongo',
    meaning: 'Japanese Language',
    audioTime: 7.2,
  },
])

// Better Mock Data with Ruby Support
// Helper to create text part
const t = (k, r = '') => ({ k, r })

const conversationData = ref({
  title: '',
  conversation_image: '',
  lines: [],
})

const examplesData = ref([]);
const examplesArticleData = ref([]);
const articleData = ref({
  conversation_audio: '',
});

// Audio State
const currentAudioSrc = ref(
  import.meta.env.VITE_APP_FILE_SYSTEM_BASE_URL + '/handjp/wordsAudios/第1课.mp3',
) // Placeholder MP3
const currentLrc = ref(
  import.meta.env.VITE_APP_FILE_SYSTEM_BASE_URL + '/handjp/wordsAudios/第1课.lrc',
)

// Highlighting State
const activeLyricLine = ref(null)

// Navigation
const scrollToSection = (section) => {
  activeSection.value = section
  const el = sectionRefs[section].value
  if (el) {
    const offset = 100
    const bodyRect = document.body.getBoundingClientRect().top
    const elementRect = el.getBoundingClientRect().top
    const elementPosition = elementRect - bodyRect
    const offsetPosition = elementPosition - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    })
  }
}

// Handle Lyric Sync
const handleLyricChange = (lyric) => {
  activeLyricLine.value = lyric ? lyric.text : ''
}

// Play specific section audio
const playAudioAt = (time) => {
  const audioEl = document.querySelector('audio')
  if (audioEl) {
    audioEl.currentTime = time
    audioEl.play()
  }
}

// Route Hash parsing on mount
const isShrunk = ref(false)

const handleScroll = () => {
  isShrunk.value = window.scrollY > 50
}

onMounted(async () => {
  window.addEventListener('scroll', handleScroll)
  const hash = route.hash.replace('#', '')
  if (hash && sectionRefs[hash]) {
    await nextTick()
    scrollToSection(hash)
  }
  // get course detail
  getLessonByLessonId({ lesson_id: courseId }).then((res) => {
    courseTitle.value = res.data.lesson_info + ': ' + res.data.lesson_name
  })
  // get vocabulary list
  getWordsListByLessonId({ lesson_id: courseId, pageSize: 1000, pageNum: 1 }).then((res) => {
    vocabulary.value = res.data
  })
  // get article list
  getArticleByLessonId({ id: courseId }).then((res) => {
    articleData.value = res.data
    if (res.data.sentence) {
      examplesData.value = JSON.parse(res.data.sentence);
      console.log('examplesData list', examplesData.value)
    }
    if (res.data.example) {
      examplesArticleData.value = JSON.parse(res.data.example);
      console.log('examplesArticleData list', examplesArticleData.value)
    }
    if (res.data.conversation) {
      conversationData.value = {
        title: res.data.lesson_name,
        conversation_image: res.data.conversation_image,
        lines: JSON.parse(res.data.conversation),
      };
      console.log('conversationData list', conversationData.value.lines)
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Highlight Checkers - simple includes check since ruby text might break it up
// We reconstruct string from parts to check match
const matchParts = (parts, lyricText) => {
  const fullText = parts.map((p) => p.k).join('')
  // Very rough matching for demo
  return lyricText && (lyricText.includes(fullText) || fullText.includes(lyricText))
}

const isHighlighted = (text) => activeLyricLine.value === text;


const playAudio = (url) => {
  currentAudioSrc.value = import.meta.env.VITE_APP_FILE_SYSTEM_BASE_URL + url;
  playAudioAt(0)
}
</script>

<template>
  <div class="min-h-screen pt-0 pb-48 bg-gray-50 flex flex-col">
    <!-- Navbar Spacer for Fixed Nav (approx 80px) -->
    <div class="h-24"></div>

    <div class="flex flex-1 px-6">
      <!-- Left Sidebar Navigation -->
      <aside class="fixed left-6 top-32 w-12 flex flex-col items-center gap-6 z-30 hidden lg:flex">
        <button v-for="section in ['vocabulary', 'conversation', 'examples']" :key="section"
          @click="scrollToSection(section)" class="group relative flex items-center justify-center p-2">
          <div class="w-3 h-3 rounded-full transition-all duration-300" :class="activeSection === section
            ? 'bg-indigo-600 scale-125'
            : 'bg-gray-300 group-hover:bg-indigo-400'
            "></div>
          <span
            class="absolute left-8 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            {{ section.charAt(0).toUpperCase() + section.slice(1) }}
          </span>
        </button>
      </aside>

      <div class="max-w-4xl mx-auto w-full lg:pl-12 relative">
        <!-- Sticky Header / Back Button -->
        <div
          class="sticky top-20 z-40 bg-white/95 backdrop-blur-md shadow-sm rounded-xl border border-gray-100 mb-8 transition-all duration-300 overflow-hidden"
          :class="isShrunk ? 'py-2 px-4' : 'py-4 px-6'">
          <div class="flex items-center justify-between h-full">
            <div class="flex items-center gap-4">
              <button @click="router.back()"
                class="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors rounded-lg hover:bg-indigo-50"
                :class="isShrunk ? 'px-2 py-1' : 'px-3 py-1 -ml-3'">
                <ArrowLeftIcon class="h-5 w-5" />
                <span v-if="!isShrunk">コース一覧に戻る</span>
                <span v-else class="text-sm">戻る</span>
              </button>

              <transition enter-active-class="transition duration-300 ease-out"
                enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 -translate-y-2">
                <h1 v-show="!isShrunk" class="text-2xl font-bold text-gray-900 leading-tight">
                  {{ courseTitle }}
                </h1>
              </transition>
            </div>

            <!-- Quick Actions when Shrunk (Optional, but nice) -->
            <div v-show="isShrunk" class="text-gray-900 font-bold truncate max-w-[200px]">
              {{ courseTitle }}
            </div>
          </div>
        </div>

        <!-- Sections Stack -->
        <div class="space-y-16">
          <!-- Vocabulary Section -->
          <section :ref="sectionRefs.vocabulary" id="vocabulary" class="scroll-mt-48 transition-all duration-500">
            <div class="flex items-center gap-4 mb-6 border-b border-gray-200 pb-4">
              <BookOpenIcon class="h-8 w-8 text-indigo-500" />
              <h2 class="text-2xl font-bold text-gray-800">
                <ruby>
                  単語
                  <rt>たんご</rt>
                </ruby>
              </h2>
              <button @click="playAudioAt(0.5)"
                class="ml-auto text-indigo-600 hover:text-indigo-800 transition-colors p-2 rounded-full hover:bg-indigo-50"
                title="Play Section Audio">
                <SpeakerWaveIcon class="h-6 w-6" />
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div v-for="item in vocabulary" :key="item.word_id"
                class="bg-white p-4 rounded-xl border-l-4 transition-all duration-300 cursor-pointer hover:shadow-md"
                :class="isHighlighted(item.kanji)
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                  : 'border-transparent hover:border-indigo-300'
                  " @click="playAudioAt(item.audioTime)">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-4">
                    <div class="text-2xl font-medium text-gray-800">
                      <span v-html="item.ruby"></span>
                      <!-- <ruby>
                      {{ item.kanji }}
                      <rt class="text-xs text-indigo-500">{{ item.katagana }}</rt>
                    </ruby> -->
                      <span v-if="item.mark" class="text-xs text-indigo-500 ml-2">{{
                        '[' + item.mark + ']'
                      }}</span>
                      <span v-if="item.category" class="text-xs text-indigo-500 ml-2">
                        {{ '<' + item.category + '>' }} </span>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-medium text-gray-700">{{ item.chinese }}</div>
                  </div>
                </div>
                <div class="mt-2 text-sm text-gray-600">
                  <span class="font-bold">例: </span>
                  <span v-html="item.exampleRuby"></span>
                  <div class="mt-1 text-gray-500 ml-6">{{ item.exampleTranslation }}</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Examples Section -->
          <section :ref="sectionRefs.examples" id="examples" class="scroll-mt-48 transition-all duration-500">
            <div class="flex items-center gap-4 mb-6 border-b border-gray-200 pb-4">
              <PencilSquareIcon class="h-8 w-8 text-indigo-500" />
              <h2 class="text-2xl font-bold text-gray-800">
                <ruby>
                  文型
                  <rt>ぶんけい</rt>
                </ruby>
              </h2>
              <button @click="playAudioAt(32.0)"
                class="ml-auto text-indigo-600 hover:text-indigo-800 transition-colors p-2 rounded-full hover:bg-indigo-50"
                title="Play Section Audio">
                <SpeakerWaveIcon class="h-6 w-6" />
              </button>
            </div>

            <div class="space-y-4">
              <div v-for="ex in examplesData" :key="ex.id"
                class="bg-white p-5 rounded-xl border-l-4 transition-all duration-300 cursor-pointer hover:shadow-md"
                :class="isHighlighted(ex.kanji)
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                  : 'border-transparent hover:border-indigo-300'">
                <!-- : class=" matchParts(ex.parts, activeLyricLine) ? 'border-amber-400 bg-amber-50'
                : 'border-gray-200 hover:border-gray-300' " @click=" playAudioAt(ex.audioTime)" -->
                <p class="text-xl text-gray-800 mb-2 font-medium leading-relaxed">
                  <span v-html="ex.ruby"></span>
                </p>
                <p class="text-gray-500 text-sm italic">{{ ex.translate }}</p>
              </div>
            </div>
          </section>
          <!-- Examples Article Section -->
          <section :ref="sectionRefs.examples" id="examples" class="scroll-mt-48 transition-all duration-500">
            <div class="flex items-center gap-4 mb-6 border-b border-gray-200 pb-4">
              <PencilSquareIcon class="h-8 w-8 text-indigo-500" />
              <h2 class="text-2xl font-bold text-gray-800">
                <ruby>
                  例文
                  <rt>れいぶん</rt>
                </ruby>
              </h2>
              <button @click="playAudioAt(32.0)"
                class="ml-auto text-indigo-600 hover:text-indigo-800 transition-colors p-2 rounded-full hover:bg-indigo-50"
                title="Play Section Audio">
                <SpeakerWaveIcon class="h-6 w-6" />
              </button>
            </div>

            <div class="space-y-4">
              <div v-for="ex in examplesArticleData" :key="ex.id"
                class="bg-white p-5 rounded-xl border-l-4 transition-all duration-300 cursor-pointer hover:shadow-md"
                :class="isHighlighted(ex.kanji)
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                  : 'border-transparent hover:border-indigo-300'">
                <p class="text-xl text-gray-800 mb-2 font-medium leading-relaxed">
                  <span v-html="ex.ruby"></span>
                </p>
                <p class="text-gray-500 text-sm italic">{{ ex.translate }}</p>
              </div>
            </div>
          </section>
          <!-- Conversation Section -->
          <section :ref="sectionRefs.conversation" id="conversation" class="scroll-mt-48 transition-all duration-500">
            <div class="flex items-center gap-4 mb-6 border-b border-gray-200 pb-4">
              <ChatBubbleLeftRightIcon class="h-8 w-8 text-indigo-500" />
              <h2 class="text-2xl font-bold text-gray-800">Conversation</h2>
              <button @click="playAudio(articleData.conversation_audio)"
                class="ml-auto text-indigo-600 hover:text-indigo-800 transition-colors p-2 rounded-full hover:bg-indigo-50"
                title="Play Section Audio">
                <SpeakerWaveIcon class="h-6 w-6" />
              </button>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div
                class="p-4 bg-gray-50 border-b border-gray-100 font-medium text-gray-600 flex justify-between items-center">
                <span>{{ conversationData.title }}</span>
              </div>
              <div class="p-6 space-y-6">
                <div v-for="line in conversationData.lines" :key="line.id">
                  <p class="text-lg text-gray-800 mb-1 font-medium leading-relaxed transition-colors duration-300">
                    <span v-html="line.nameRuby"></span>
                    <span v-if="line.nameRuby">: </span>
                    <span v-html="line.ruby"></span>
                  </p>
                  <p class="text-gray-500 text-sm">{{ line.translate }}xxx</p>
                </div>
                <img :src="fileSystemBaseUrl + conversationData.conversation_image" alt="" srcset="">
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- Audio Player Component -->
      <AudioPlayer :src="currentAudioSrc" :lrc="currentLrc" :title="courseTitle" @lyric-change="handleLyricChange" />
    </div>
  </div>
</template>

<style scoped>
html {
  scroll-behavior: smooth;
}
</style>
