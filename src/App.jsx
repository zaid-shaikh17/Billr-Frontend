import { Routes, Route, Outlet, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import Dashboard from './pages/Dashboard/Dashboard'
import Clients from './pages/Clients/Clients'
import Invoices from './pages/Invoices/Invoices'
import Profile from './pages/Profile/Profile'
import Layout from './components/Layout/Layout'

const ProtectedLayout = () => {
  const { user, loading } = useAuth()
  if (loading) return <div className='loading'>Loading...</div>
  if (!user) return <Navigate to='/login' replace />
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

function App() {
  return (
    <>
      <Toaster position='top-right' />
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route element={<ProtectedLayout />}>
          <Route path='/' element={<Dashboard />} />
          <Route path='/clients' element={<Clients />} />
          <Route path='/invoices' element={<Invoices />} />
          <Route path='/profile' element={<Profile />} />
        </Route>
      </Routes>
    </>
  )
}

export default App