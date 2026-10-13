import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import JobTrackerLoader from '../components/JobTrackerLoader'
import '../styles/auth.css'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Register() {
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }))
    setServerError('')
    setSuccess('')
  }

  function validate() {
    const nextErrors = {}
    const name = form.name.trim()
    const email = form.email.trim()
    if (!name) nextErrors.name = 'Full name is required.'
    if (!email) nextErrors.email = 'Email address is required.'
    else if (!emailPattern.test(email)) nextErrors.email = 'Enter a valid email address.'
    if (!form.password) nextErrors.password = 'Password is required.'
    else if (form.password.length < 6) nextErrors.password = 'Password must be at least 6 characters.'
    if (!form.confirmPassword) nextErrors.confirmPassword = 'Please confirm your password.'
    else if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Passwords do not match.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (isSubmitting || !validate()) return
    setIsSubmitting(true)
    setServerError('')
    setSuccess('')
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password })
      setSuccess('Your account is ready. Sign in to start tracking applications.')
      setForm((current) => ({ ...current, password: '', confirmPassword: '' }))
    } catch (error) {
      setServerError(error?.response?.status === 400 ? 'An account with this email already exists.' : 'Unable to create your account right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-showcase" aria-label="JobTracker overview">
        <Link className="auth-brand" to="/login" aria-label="JobTracker home"><span className="auth-brand-mark">JT</span><span>JobTracker</span></Link>
        <div className="auth-showcase-copy">
          <span className="auth-eyebrow">START YOUR WORKSPACE</span>
          <h1>Turn your job search into a clear plan.</h1>
          <p>Create one reliable place for applications, interview stages, useful links, and notes.</p>
          <ul><li>Build your application pipeline</li><li>Focus on the next action</li><li>Stay organized from apply to offer</li></ul>
        </div>
        <p className="auth-showcase-footer">A calmer, clearer way to manage your career journey.</p>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card auth-card-register">
          <div className="auth-mobile-brand"><span className="auth-brand-mark">JT</span><span>JobTracker</span></div>
          <header className="auth-header"><h2>Create your account</h2><p>Start organizing your job search in minutes.</p></header>
          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field"><label htmlFor="register-name">Full Name</label><input id="register-name" name="name" autoComplete="name" value={form.name} onChange={handleChange} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'register-name-error' : undefined} placeholder="Your full name" />{errors.name && <span id="register-name-error" className="auth-field-error">{errors.name}</span>}</div>
            <div className="auth-field"><label htmlFor="register-email">Email Address</label><input id="register-email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'register-email-error' : undefined} placeholder="you@example.com" />{errors.email && <span id="register-email-error" className="auth-field-error">{errors.email}</span>}</div>
            <div className="auth-field"><label htmlFor="register-password">Password</label><div className="auth-password-wrap"><input id="register-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={handleChange} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'register-password-error' : 'register-password-help'} placeholder="At least 6 characters" /><button type="button" className="auth-visibility" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button></div>{errors.password ? <span id="register-password-error" className="auth-field-error">{errors.password}</span> : <span id="register-password-help" className="auth-help">Use 6 or more characters.</span>}</div>
            <div className="auth-field"><label htmlFor="register-confirm">Confirm Password</label><div className="auth-password-wrap"><input id="register-confirm" name="confirmPassword" type={showConfirmation ? 'text' : 'password'} autoComplete="new-password" value={form.confirmPassword} onChange={handleChange} aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? 'register-confirm-error' : undefined} placeholder="Enter your password again" /><button type="button" className="auth-visibility" onClick={() => setShowConfirmation((visible) => !visible)} aria-label={showConfirmation ? 'Hide password confirmation' : 'Show password confirmation'}>{showConfirmation ? 'Hide' : 'Show'}</button></div>{errors.confirmPassword && <span id="register-confirm-error" className="auth-field-error">{errors.confirmPassword}</span>}</div>
            {serverError && <div className="auth-alert auth-alert-error" role="alert">{serverError}</div>}
            {success && <div className="auth-alert auth-alert-success" role="status">{success} <Link to="/login">Go to Login</Link></div>}
            <button className="auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? <JobTrackerLoader variant="button" message="Creating your account..." /> : 'Create Account'}</button>
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </section>
    </main>
  )
}
