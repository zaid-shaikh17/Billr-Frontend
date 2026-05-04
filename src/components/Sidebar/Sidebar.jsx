import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Sidebar.css'

const Sidebar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className='sidebar'>
      <div className='sidebar-logo'>
        <h1>Billr</h1>
        <p>Invoice smart. Get paid faster.</p>
      </div>

      <div className='sidebar-user'>
        <div className='user-avatar'>{user?.name?.charAt(0).toUpperCase()}</div>
        <div>
          <p className='user-name'>{user?.name}</p>
          <p className='user-business'>{user?.businessName || 'Freelancer'}</p>
        </div>
      </div>

      <nav className='sidebar-nav'>
        <NavLink to='/' end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Dashboard
        </NavLink>
        <NavLink to='/clients' className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Clients
        </NavLink>
        <NavLink to='/invoices' className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Invoices
        </NavLink>
      </nav>

      <button className='logout-btn' onClick={handleLogout}>
        Logout
      </button>
    </div>
  )
}

export default Sidebar