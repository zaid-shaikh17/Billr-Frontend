import { createContext, useContext, useState, useCallback } from 'react'
import { fetchInvoices, fetchClients } from '../services/api'
import { toast } from 'react-hot-toast'

const DataContext = createContext()

export const DataProvider = ({ children }) => {
  const [invoices, setInvoices] = useState(null)
  const [clients, setClients] = useState(null)
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  const [loadingClients, setLoadingClients] = useState(false)

  const loadInvoices = useCallback(async (force = false) => {
    if (invoices && !force) return
    setLoadingInvoices(true)
    try {
      const { data } = await fetchInvoices()
      if (data.success) setInvoices(data.invoices)
    } catch {
      toast.error('Failed to load invoices')
    } finally {
      setLoadingInvoices(false)
    }
  }, [invoices])

  const loadClients = useCallback(async (force = false) => {
    if (clients && !force) return
    setLoadingClients(true)
    try {
      const { data } = await fetchClients()
      if (data.success) setClients(data.clients)
    } catch {
      toast.error('Failed to load clients')
    } finally {
      setLoadingClients(false)
    }
  }, [clients])

  const refreshInvoices = () => loadInvoices(true)
  const refreshClients = () => loadClients(true)

  return (
    <DataContext.Provider value={{
      invoices, setInvoices,
      clients, setClients,
      loadInvoices, loadClients,
      refreshInvoices, refreshClients,
      loadingInvoices, loadingClients
    }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)