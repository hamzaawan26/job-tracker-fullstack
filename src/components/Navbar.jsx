
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import '../styles/layout.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const displayName = user?.name || user?.email || 'User'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <Link to={user ? '/dashboard' : '/login'}>
          <div className="navbar-logo">JT</div>
          <div className="navbar-brand-text">
            <span className="navbar-title">JobTracker</span>
            <span className="navbar-subtitle">
              Career Management Platform
            </span>
          </div>
        </Link>
      </div>

      <div className="navbar-actions">
        {user ? (
          <>
            <div className="navbar-user">
              <div className="navbar-user-info">
                <span className="navbar-username">
                  {displayName}
                </span>
                <span className="navbar-role">
                  My Account
                </span>
              </div>

              <div className="navbar-avatar">
                {initial}
              </div>
            </div>

            <button
              type="button"
              className="navbar-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <div className="navbar-guest">
            <Link to="/login" className="navbar-login">
              Login
            </Link>
            <Link to="/register" className="navbar-register">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
