import './App.css'
import { Routes, Route, Outlet, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'))
const Clients = lazy(() => import('./pages/Clients/Clients'))
const Invoices = lazy(() => import('./pages/Invoices/Invoices'))
const Profile = lazy(() => import('./pages/Profile/Profile'))
const ClientDetail = lazy(() => import('./pages/ClientDetail/ClientDetail'))
import Layout from './components/Layout/Layout'
import { lazy, Suspense } from 'react'

const ProtectedLayout = () => {
  const { user, loading } = useAuth()
  if(loading) return <div className='loading'>Loading...</div>
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
      <Suspense fallback={<div className='loading'>Loading...</div>}>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route element={<ProtectedLayout />}>
          <Route path='/' element={<Dashboard />} />
          <Route path='/clients' element={<Clients />} />
          <Route path='/invoices' element={<Invoices />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/clients/:id' element={<ClientDetail />} />
        </Route>
      </Routes>
      </Suspense>
    </>
  )
}

export default App