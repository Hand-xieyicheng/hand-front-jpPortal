<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { parseLrc, findActiveLrcIndex } from '../utils/lrcParser'
import { 
  PlayIcon, 
  PauseIcon, 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon, 
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/vue/24/solid'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  lrc: {
    type: String, // Raw LRC content
    default: ''
  },
  title: {
    type: String,
    default: 'Audio Track'
  }
})

const emit = defineEmits(['timeupdate', 'lyric-change'])

const audio = ref(null)
const isPlaying = ref(false)
const duration = ref(0)
const currentTime = ref(0)
const volume = ref(1)
const playbackRate = ref(1)
const isMuted = ref(false)
const isLooping = ref(false)

// LRC State
const parsedLrc = computed(() => parseLrc(props.lrc))
const currentLrcIndex = ref(-1)

// Speed Options
const speedOptions = [0.5, 1.0, 1.25, 1.5, 2.0]

// Format time utility
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const isVisible = ref(false)

const closePlayer = () => {
  if (audio.value) {
    audio.value.pause()
    audio.value.currentTime = 0
    isPlaying.value = false
  }
  isVisible.value = false
}

// Progress Bar Style
const progressStyle = computed(() => {
  const percent = duration.value ? (currentTime.value / duration.value) * 100 : 0
  return {
    background: `linear-gradient(to right, #9333EA ${percent}%, #e5e7eb ${percent}%)`
  }
})

const togglePlay = () => {
  if (!audio.value) return
  if (isPlaying.value) {
    audio.value.pause()
  } else {
    audio.value.play()
  }
}

// ... other toggles

// Event Listeners
const onTimeUpdate = () => {
  if (!audio.value) return
  currentTime.value = audio.value.currentTime
  
  // Sync Lyrics
  const newIndex = findActiveLrcIndex(parsedLrc.value, currentTime.value)
  if (newIndex !== currentLrcIndex.value) {
    currentLrcIndex.value = newIndex
    emit('lyric-change', newIndex >= 0 ? parsedLrc.value[newIndex] : null)
  }
  
  emit('timeupdate', currentTime.value)
}

const onLoadedMetadata = () => {
  if (!audio.value) return
  duration.value = audio.value.duration
}

const onEnded = () => {
  isPlaying.value = false
  // isVisible.value = false // Optional: hide on end? User said "Show... paused (after playback starts but not ended)". 
  // Probably keep visible if just ended or paused. User said "Hide... when there is no MP3 audio playing (including the initial state...)".
  // "Show... only when... actively playing... or paused".
  // So, keep visible.
  if (!isLooping.value) {
    // Optionally reset or just stop
  }
}

const onPlay = () => {
  isPlaying.value = true
  isVisible.value = true
}
const onPause = () => isPlaying.value = false

onMounted(() => {
  if (audio.value) {
    audio.value.volume = volume.value
    audio.value.playbackRate = playbackRate.value
  }
})

// Watch source change to reset
watch(() => props.src, () => {
  if (audio.value) {
    audio.value.load()
    isPlaying.value = false
    currentTime.value = 0
    // Keep visibility if we just changed track? Or hide? 
    // "Hide... when there is no MP3... including initial state".
    // If we switch track, we are in initial state of new track.
    isVisible.value = false 
  }
})
</script>

<template>
  <transition
    enter-active-class="transform transition duration-500 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transform transition duration-300 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div v-show="isVisible" class="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] py-3 px-4 z-40">
      <div class="max-w-5xl mx-auto flex flex-col items-center gap-2 relative">
        <audio 
          ref="audio"
          :src="src"
          @timeupdate="onTimeUpdate"
          @loadedmetadata="onLoadedMetadata"
          @ended="onEnded"
          @play="onPlay"
          @pause="onPause"
        ></audio>

        <!-- Sidebar Close Button (Absolute right centered) -->
        <button 
          @click="closePlayer"
          class="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 rounded-full hover:bg-gray-100"
          title="Close Player"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>

            <!-- Progress Bar & Time -->
        <div class="w-full flex items-center gap-3 text-xs text-gray-500 font-mono pr-12">
          <span>{{ formatTime(currentTime) }}</span>
          <input 
            type="range" 
            min="0" 
            :max="duration" 
            :value="currentTime" 
            @input="seek"
            :style="progressStyle"
            class="flex-1 h-1.5 appearance-none cursor-pointer rounded-full"
          />
          <span>{{ formatTime(duration) }}</span>
        </div>

        <!-- Controls Row -->
        <div class="w-full flex items-center justify-between pr-12">
          
          <!-- Volume -->
          <div class="flex items-center gap-2 w-1/4">
            <button @click="toggleMute" class="text-gray-500 hover:text-indigo-600 transition-colors">
              <SpeakerXMarkIcon v-if="isMuted || volume === 0" class="h-5 w-5" />
              <SpeakerWaveIcon v-else class="h-5 w-5" />
            </button>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              :value="volume" 
              @input="adjustVolume"
              class="w-24 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <!-- Main Controls -->
          <div class="flex items-center gap-6">
            <button 
              @click="toggleLoop" 
              class="text-xl transition-all p-2 rounded-full"
              :class="isLooping ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'"
              title="Loop Mode"
            >
              <ArrowPathIcon class="h-6 w-6" />
            </button>

            <!-- Play/Pause Button -->
            <button 
              @click="togglePlay" 
              class="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              <transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="opacity-0 scale-50"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition duration-100 ease-in absolute"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-50"
              >
                <PauseIcon v-if="isPlaying" class="h-6 w-6" />
                <PlayIcon v-else class="h-6 w-6 ml-1" />
              </transition>
            </button>

            <!-- Speed Dropdown -->
            <div class="relative group pb-2">
               <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-0 hidden group-hover:flex flex-col bg-white shadow-lg rounded-lg border border-gray-100 py-1 min-w-[60px] z-50">
                 <button 
                   v-for="rate in speedOptions" 
                   :key="rate" 
                   @click="changeSpeed(rate)"
                   class="px-3 py-1 text-xs text-center transition-colors"
                   :class="rate === playbackRate ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-600 hover:bg-gray-50'"
                 >
                   {{ rate }}x
                 </button>
               </div>
               <button class="text-xs font-bold px-2 py-1 rounded bg-gray-100 hover:bg-indigo-50 text-gray-700 transition-colors min-w-[3rem]">
                 {{ playbackRate }}x
               </button>
            </div>
          </div>

          <!-- Title -->
          <div class="w-1/4 text-right truncate text-sm font-medium text-gray-700">
            {{ title }}
          </div>

        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
/* Custom Slider Styling for WebKit */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  background: #4F46E5; /* Indigo 600 */
  border: 2px solid #ffffff; /* White border for contrast */
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  margin-top: -4px; /* Adjust to center on track */
}

input[type="range"]::-webkit-slider-runnable-track {
  width: 100%;
  height: 6px;
  cursor: pointer;
  border-radius: 4px;
  /* Background color is handled by inline style for gradient */
}

/* Firefox */
input[type="range"]::-moz-range-thumb {
  width: 14px;
  height: 14px;
  background: #4F46E5;
  border: 2px solid #ffffff;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}
</style>
