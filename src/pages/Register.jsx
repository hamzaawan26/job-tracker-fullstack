import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import '../styles/auth.css'

function Register() {
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')
    setMsg('')

    try {
      await register(form)
      setMsg('Account created. Please login.')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="auth-box">
      <h2>Register</h2>

      {msg && <p className="success">{msg}</p>}
      {error && <p className="error">{error}</p>}

      <form onSubmit={submit}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button>Create Account</button>
      </form>
    </div>
  )
}

export default Register
