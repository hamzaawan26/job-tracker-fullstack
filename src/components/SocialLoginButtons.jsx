import { useAuth } from '../auth/useAuth'
import { useNavigate } from 'react-router-dom'

function SocialLoginButtons() {
  const { social } = useAuth()
  const navigate = useNavigate()

  function handleSocial(provider) {
    social(provider)
    navigate('/') // 🔥 REDIRECT AFTER SOCIAL LOGIN
  }

  return (
    <div>
      <button onClick={() => handleSocial('google')}>
        Continue with Google
      </button>

      <button onClick={() => handleSocial('github')}>
        Continue with GitHub
      </button>

      <button onClick={() => handleSocial('linkedin')}>
        Continue with LinkedIn
      </button>
    </div>
  )
}

export default SocialLoginButtons
