import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BooksView from '../views/BooksView.vue'
import CoursesView from '../views/CoursesView.vue'
import { useAuthStore } from '@/stores/auth'
import { getUserInfo } from '@/services/authService'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/books',
      name: 'books',
      component: BooksView,
    },
    {
      path: '/books/:bookId/courses',
      name: 'courses',
      component: CoursesView,
    },
    {
      path: '/courses/:courseId/learn',
      name: 'course-detail',
      component: () => import('../views/CourseDetailView.vue'),
    },
    // Redirect old vocabulary route if needed or just remove
    {
      path: '/courses/:courseId/vocabulary',
      redirect: (to) => {
        return {
          name: 'course-detail',
          params: { courseId: to.params.courseId },
          hash: '#vocabulary',
        }
      },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const { token, refresh_token } = to.query

  // Case 1: Tokens do NOT exist in store
  if (!authStore.token) {
    if (token && refresh_token) {
      // ✅ Tokens exist in URL
      try {
        // Save tokens first
        authStore.setTokens(token, refresh_token)
        // Call API
        const res = await getUserInfo({ token })
        if (res.code === 0) {
          authStore.setUserInfo(res.data)
          // Clean URL query params ideally, but for now just proceed
          // To properly clean URL we would need to redirect to the same path without query params,
          // but 'next()' keeps us on the current navigation.
          // Requirement says "Proceed to the target page (next())", so we just do that.
          next()
        } else {
          // Failed to get user info - redirect to login
          window.location.href =
            import.meta.env.VITE_APP_AUTH_SYSTEM_BASE_URL +
            '/login?redirect=' +
            encodeURIComponent(window.location.href)
        }
      } catch (error) {
        console.error('Auth error:', error)
        window.location.href =
          import.meta.env.VITE_APP_AUTH_SYSTEM_BASE_URL +
          '/login?redirect=' +
          encodeURIComponent(window.location.href)
      }
    } else {
      // ❌ Tokens do NOT exist in URL
      // Redirect to third-party login page
      window.location.href =
        import.meta.env.VITE_APP_AUTH_SYSTEM_BASE_URL +
        '/login?redirect=' +
        encodeURIComponent(window.location.href)
    }
  } else {
    // Case 2: Tokens exist in store
    if (authStore.userInfo) {
      // ✅ userInfo exists
      next()
    } else {
      // ❌ userInfo does NOT exist
      try {
        const res = await getUserInfo({ token: authStore.token })
        if (res.code === 0) {
          authStore.setUserInfo(res.data)
          next()
        } else {
          // Token might be invalid
          window.location.href =
            import.meta.env.VITE_APP_AUTH_SYSTEM_BASE_URL +
            '/login?redirect=' +
            encodeURIComponent(window.location.href)
        }
      } catch (error) {
        console.error('Auth error:', error)
        window.location.href =
          import.meta.env.VITE_APP_AUTH_SYSTEM_BASE_URL +
          '/login?redirect=' +
          encodeURIComponent(window.location.href)
      }
    }
  }
})

export default router
