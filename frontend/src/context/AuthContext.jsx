import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, TOKEN_KEY } from '../lib/api'

const AuthContext = createContext(null)

const REFRESH_KEY = 'forum_refresh_token'
const USERNAME_KEY = 'forum_username'

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem(REFRESH_KEY))
  const [username, setUsername] = useState(() => localStorage.getItem(USERNAME_KEY))

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USERNAME_KEY)
    setAccessToken(null)
    setRefreshToken(null)
    setUsername(null)
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => clearSession()
    window.addEventListener('forum:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('forum:unauthorized', handleUnauthorized)
  }, [clearSession])

  const login = async ({ username: enteredUsername, password }) => {
    const { data } = await api.post('/authentications', {
      username: enteredUsername,
      password,
    })

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.data

    localStorage.setItem(TOKEN_KEY, newAccessToken)
    localStorage.setItem(REFRESH_KEY, newRefreshToken)
    localStorage.setItem(USERNAME_KEY, enteredUsername)

    setAccessToken(newAccessToken)
    setRefreshToken(newRefreshToken)
    setUsername(enteredUsername)
  }

  const logout = async () => {
    if (refreshToken) {
      try {
        await api.delete('/authentications', { data: { refreshToken } })
      } catch {
        // Abaikan error saat logout, sesi lokal tetap dibersihkan
      }
    }
    clearSession()
  }

  const value = {
    accessToken,
    refreshToken,
    username,
    isAuthenticated: Boolean(accessToken),
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth harus dipakai di dalam <AuthProvider>')
  }
  return context
}
