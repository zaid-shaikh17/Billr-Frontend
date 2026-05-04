export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount)
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

export const getStatusColor = (status) => {
  const colors = {
    Draft: '#6c757d',
    Sent: '#007bff',
    Paid: '#28a745',
    Overdue: '#dc3545'
  }
  return colors[status] || '#6c757d'
}