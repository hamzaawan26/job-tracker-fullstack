import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import JobTrackerLoader from '../components/JobTrackerLoader'
import '../styles/auth.css'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }))
    setServerError('')
  }

  function validate() {
    const nextErrors = {}
    const email = form.email.trim()
    if (!email) nextErrors.email = 'Email address is required.'
    else if (!emailPattern.test(email)) nextErrors.email = 'Enter a valid email address.'
    if (!form.password) nextErrors.password = 'Password is required.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (isSubmitting || !validate()) return
    setIsSubmitting(true)
    setServerError('')
    try {
      await login({ email: form.email.trim(), password: form.password })
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setServerError(error?.response?.status === 400 ? 'The email or password is incorrect.' : 'Unable to sign in right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-showcase" aria-label="JobTracker overview">
        <Link className="auth-brand" to="/login" aria-label="JobTracker home">
          <span className="auth-brand-mark">JT</span>
          <span>JobTracker</span>
        </Link>
        <div className="auth-showcase-copy">
          <span className="auth-eyebrow">CAREER MANAGEMENT PLATFORM</span>
          <h1>Your next opportunity, organized.</h1>
          <p>Track applications, stay ready for interviews, and keep your career momentum in one focused workspace.</p>
          <ul><li>Monitor every application</li><li>See progress at a glance</li><li>Keep important details together</li></ul>
        </div>
        <p className="auth-showcase-footer">Built to keep your job search moving forward.</p>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-mobile-brand"><span className="auth-brand-mark">JT</span><span>JobTracker</span></div>
          <header className="auth-header"><h2>Welcome back</h2><p>Sign in to manage your job applications.</p></header>
          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="login-email">Email Address</label>
              <input id="login-email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'login-email-error' : undefined} placeholder="you@example.com" />
              {errors.email && <span id="login-email-error" className="auth-field-error">{errors.email}</span>}
            </div>
            <div className="auth-field">
              <label htmlFor="login-password">Password</label>
              <div className="auth-password-wrap">
                <input id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={handleChange} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'login-password-error' : undefined} placeholder="Enter your password" />
                <button type="button" className="auth-visibility" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button>
              </div>
              {errors.password && <span id="login-password-error" className="auth-field-error">{errors.password}</span>}
            </div>
            {serverError && <div className="auth-alert auth-alert-error" role="alert">{serverError}</div>}
            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <JobTrackerLoader variant="button" message="Signing you in..." /> : 'Sign In'}
            </button>
          </form>
          <p className="auth-switch">New to JobTracker? <Link to="/register">Create an account</Link></p>
        </div>
      </section>
    </main>
  )
}
