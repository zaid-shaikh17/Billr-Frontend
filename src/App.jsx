import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import Dashboard from './pages/Dashboard/Dashboard'
import Clients from './pages/Clients/Clients'
import Invoices from './pages/Invoices/Invoices'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'

function App() {
  return (
    <>
      <Toaster position='top-right' />
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path='/clients' element={<ProtectedRoute><Clients /></ProtectedRoute>} />
        <Route path='/invoices' element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
      </Routes>
    </>
  )
}

export default App