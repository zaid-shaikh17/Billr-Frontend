import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { loginUser } from '../../services/api'
import '../../styles/auth.css'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await loginUser(formData)
      if (data.success) {
        login(data.user, data.token)
        toast.success('Welcome back!')
        navigate('/')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='auth-container'>
      <div className='auth-card'>
        <div className='auth-header'>
          <h1 className='auth-logo'>Billr</h1>
          <p className='auth-tagline'>Invoice smart. Get paid faster.</p>
        </div>

        <form className='auth-form' onSubmit={handleSubmit}>
          <h2>Welcome back</h2>
          <p className='auth-subtitle'>Sign in to your account</p>

          <div className='form-group'>
            <label>Email</label>
            <input
              type='email'
              name='email'
              placeholder='you@example.com'
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className='form-group'>
            <label>Password</label>
            <input
              type='password'
              name='password'
              placeholder='Enter your password'
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button className='btn-primary' type='submit' disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className='auth-switch'>
            Don't have an account? <Link to='/register'>Register</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login