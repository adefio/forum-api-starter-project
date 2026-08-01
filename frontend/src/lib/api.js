import axios from 'axios'

export const TOKEN_KEY = 'forum_access_token'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error
    const isLoginAttempt =
      config?.method === 'post' && String(config?.url).includes('/authentications')

    if (response && response.status === 401 && !isLoginAttempt) {
      localStorage.removeItem(TOKEN_KEY)
      window.dispatchEvent(new Event('forum:unauthorized'))
    }

    return Promise.reject(error)
  },
)

export function getErrorMessage(error, fallback = 'Terjadi kesalahan, silakan coba lagi.') {
  return error?.response?.data?.message || fallback
}

export async function uploadImage(file) {
  const formData = new FormData()
  formData.append('image', file)
  const { data } = await api.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data.url
}
