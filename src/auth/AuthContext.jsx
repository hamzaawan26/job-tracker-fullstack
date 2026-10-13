import { useEffect, useState } from 'react'
import { loginApi, registerApi, meApi } from '../api/authApi'
import { AuthContext } from './auth-context'
import JobTrackerLoader from '../components/JobTrackerLoader'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const data = await meApi()
        setUser(data.user)
      } catch {
        localStorage.removeItem('token')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  async function login(credentials) {
    const data = await loginApi(credentials)
    localStorage.setItem('token', data.token)
    setUser(data.user)
  }

  async function register(data) {
    await registerApi(data)
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
  }

  if (loading) {
    return <JobTrackerLoader variant="fullScreen" message="Checking your session..." />
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
