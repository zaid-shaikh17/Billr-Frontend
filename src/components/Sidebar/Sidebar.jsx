import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Sidebar.css'
import { useState } from 'react'

const Sidebar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const closeMenu = () => setIsOpen(false)

  const NavItem = ({ to, end, children }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
    onClick={closeMenu}
  >
    {children}
  </NavLink>
)

  return (
    <>
      <button className='hamburger' onClick={() => setIsOpen(!isOpen)}>☰</button>

        {isOpen && <div className='sidebar-overlay' onClick={closeMenu}></div>}

      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <button className='close-sidebar' onClick={closeMenu}>x</button>
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
          <NavItem to='/' end>Dashboard</NavItem>
          <NavItem to='/clients'>Clients</NavItem>
          <NavItem to='/invoices'>Invoices</NavItem>
          <NavItem to='/profile'>Profile</NavItem>
        </nav>
        <button className='logout-btn' onClick={handleLogout}>
          Logout
        </button>
      </div>
    </>
  )
}

export default Sidebar