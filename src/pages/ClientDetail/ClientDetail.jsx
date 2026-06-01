import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { fetchClient, fetchInvoicesByClient } from '../../services/api'
import { formatCurrency, formatDate } from '../../utils/helpers'
import './ClientDetail.css'

const ClientDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [clientRes, invoiceRes] = await Promise.all([
        fetchClient(id),
        fetchInvoicesByClient(id)
      ])
      if (clientRes.data.success) setClient(clientRes.data.client)
      if (invoiceRes.data.success) setInvoices(invoiceRes.data.invoices)
    } catch (error) {
      toast.error('Failed to load client details')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const totalEarned = useMemo(() =>
    invoices.filter(inv => inv.status === 'Paid')
      .reduce((sum, inv) => sum + inv.total, 0)
  , [invoices])

  const totalPending = useMemo(() =>
    invoices.filter(inv => inv.status === 'Sent')
      .reduce((sum, inv) => sum + inv.total, 0)
  , [invoices])

  if (loading) return <div className='loading'>Loading...</div>
  if (!client) return <div className='loading'>Client not found</div>

  return (
    <div>
      <button className='back-btn' onClick={() => navigate('/clients')}>
        ← Back to Clients
      </button>

      <div className='client-detail-header'>
        <div className='client-detail-avatar'>
          {client.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2>{client.name}</h2>
          {client.company && client.company !== 'NA' && (
            <p className='client-detail-meta'>{client.company}</p>
          )}
          <p className='client-detail-meta'>{client.email}</p>
          {client.phone && <p className='client-detail-meta'>{client.phone}</p>}
          {client.notes && <p className='client-detail-notes'>{client.notes}</p>}
        </div>
      </div>

      <div className='client-stats'>
        <div className='stat-card earned'>
          <p className='stat-label'>Total Earned</p>
          <h3 className='stat-value'>{formatCurrency(totalEarned)}</h3>
        </div>
        <div className='stat-card pending'>
          <p className='stat-label'>Pending</p>
          <h3 className='stat-value'>{formatCurrency(totalPending)}</h3>
        </div>
        <div className='stat-card total'>
          <p className='stat-label'>Total Invoices</p>
          <h3 className='stat-value'>{invoices.length}</h3>
        </div>
      </div>

      <div className='client-invoices-section'>
        <h3>Invoice History</h3>
        {invoices.length === 0 ? (
          <p className='empty-text'>No invoices for this client yet.</p>
        ) : (
          <table className='invoice-table'>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv._id}>
                  <td>{inv.invoiceNumber}</td>
                  <td>{formatCurrency(inv.total)}</td>
                  <td>{formatDate(inv.dueDate)}</td>
                  <td>
                    <span className={`status-badge ${inv.status.toLowerCase()}`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default ClientDetail