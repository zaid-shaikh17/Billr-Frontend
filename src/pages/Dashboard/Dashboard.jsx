import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../../context/AuthContext'
import { fetchInvoices } from '../../services/api'
import { formatCurrency, formatDate } from '../../utils/helpers'
import Sidebar from '../../components/Sidebar/Sidebar'
import './Dashboard.css'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    loadInvoices()
  }, [user])

  const loadInvoices = async () => {
    try {
      const { data } = await fetchInvoices()
      if (data.success) setInvoices(data.invoices)
    } catch (error) {
      toast.error('Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }

  const totalEarned = invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.total, 0)

  const totalPending = invoices
    .filter(inv => inv.status === 'Sent')
    .reduce((sum, inv) => sum + inv.total, 0)

  const totalOverdue = invoices
    .filter(inv => inv.status === 'Overdue')
    .reduce((sum, inv) => sum + inv.total, 0)

  const monthlyData = invoices.reduce((acc, inv) => {
    const month = new Date(inv.createdAt).toLocaleString('en-IN', { month: 'short' })
    const existing = acc.find(item => item.month === month)
    if (existing) {
      existing.revenue += inv.status === 'Paid' ? inv.total : 0
    } else {
      acc.push({ month, revenue: inv.status === 'Paid' ? inv.total : 0 })
    }
    return acc
  }, [])

  if (loading) return <div className='loading'>Loading...</div>

  return (
    <div className='layout'>
      <Sidebar />
      <main className='main-content'>
        <div className='page-header'>
          <h2>Welcome back, {user?.name} 👋</h2>
          <p>Here's your business overview</p>
        </div>

        <div className='stats-grid'>
          <div className='stat-card earned'>
            <p className='stat-label'>Total Earned</p>
            <h3 className='stat-value'>{formatCurrency(totalEarned)}</h3>
          </div>
          <div className='stat-card pending'>
            <p className='stat-label'>Pending</p>
            <h3 className='stat-value'>{formatCurrency(totalPending)}</h3>
          </div>
          <div className='stat-card overdue'>
            <p className='stat-label'>Overdue</p>
            <h3 className='stat-value'>{formatCurrency(totalOverdue)}</h3>
          </div>
          <div className='stat-card total'>
            <p className='stat-label'>Total Invoices</p>
            <h3 className='stat-value'>{invoices.length}</h3>
          </div>
        </div>

        <div className='chart-section'>
          <h3>Monthly Revenue</h3>
          <div className='chart-wrapper'>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width='100%' height={250}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey='month' />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey='revenue' fill='#6c63ff' radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className='empty-chart'>No data yet. Create your first invoice.</div>
            )}
          </div>
        </div>

        <div className='recent-section'>
          <h3>Recent Invoices</h3>
          {invoices.length === 0 ? (
            <p className='empty-text'>No invoices yet.</p>
          ) : (
            <table className='invoice-table'>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 5).map(inv => (
                  <tr key={inv._id}>
                    <td>{inv.invoiceNumber}</td>
                    <td>{inv.clientId?.name || 'N/A'}</td>
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
      </main>
    </div>
  )
}

export default Dashboard