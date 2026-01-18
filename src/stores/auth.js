import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref('')
    const refresh_token = ref('')
    const userInfo = ref(null)

    function setTokens(newToken, newRefreshToken) {
      token.value = newToken
      refresh_token.value = newRefreshToken
    }

    function setUserInfo(newUserInfo) {
      userInfo.value = newUserInfo
    }

    function clearAuthState() {
      token.value = ''
      refresh_token.value = ''
      userInfo.value = null
    }

    return {
      token,
      refresh_token,
      userInfo,
      setTokens,
      setUserInfo,
      clearAuthState,
    }
  },
  {
    persist: true,
  },
)
