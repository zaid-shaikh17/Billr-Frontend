import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const api = axios.create({
  baseURL: BASE_URL
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auth
export const registerUser = (data) => api.post('/api/auth/register', data)
export const loginUser = (data) => api.post('/api/auth/login', data)
export const updateProfile = (data) => api.put('/api/auth/profile', data)

// Clients
export const fetchClients = () => api.get('/api/clients')
export const fetchClient = (id) => api.get(`/api/clients/${id}`)
export const createClient = (data) => api.post('/api/clients', data)
export const updateClient = (id, data) => api.put(`/api/clients/${id}`, data)
export const removeClient = (id) => api.delete(`/api/clients/${id}`)

// Invoices
export const fetchInvoices = () => api.get('/api/invoices')
export const fetchInvoice = (id) => api.get(`/api/invoices/${id}`)
export const createInvoice = (data) => api.post('/api/invoices', data)
export const updateInvoiceStatus = (id, status) => api.put(`/api/invoices/${id}`, { status })
export const editInvoice = (id, data) => api.put(`/api/invoices/${id}/edit`, data)
export const removeInvoice = (id) => api.delete(`/api/invoices/${id}`)
export const sendEmail = (id) => api.post(`/api/email/${id}`)
export const fetchInvoicesByClient = (clientId) => api.get(`/api/invoices/client/${clientId}`)