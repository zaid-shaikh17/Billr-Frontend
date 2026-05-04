import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { registerUser } from '../../services/api'
import '../../styles/auth.css'

const Register = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await registerUser(formData)
      if (data.success) {
        login(data.user, data.token)
        toast.success('Account created!')
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
          <h2>Create account</h2>
          <p className='auth-subtitle'>Start managing your invoices</p>

          <div className='form-group'>
            <label>Full Name</label>
            <input
              type='text'
              name='name'
              placeholder='Shaikh Zaid'
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

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
              placeholder='Min 6 characters'
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className='form-group'>
            <label>Business Name <span className='optional'>(optional)</span></label>
            <input
              type='text'
              name='businessName'
              placeholder='Your business or brand name'
              value={formData.businessName}
              onChange={handleChange}
            />
          </div>

          <div className='form-group'>
            <label>Phone <span className='optional'>(optional)</span></label>
            <input
              type='text'
              name='phone'
              placeholder='9876543210'
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <button className='btn-primary' type='submit' disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className='auth-switch'>
            Already have an account? <Link to='/login'>Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Register