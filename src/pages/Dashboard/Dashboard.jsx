import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import { fetchInvoices } from "../../services/api";
import { formatCurrency, formatDate } from "../../utils/helpers";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadInvoices();
  }, [user]);

  const loadInvoices = useCallback(async () => {
    try {
      const { data } = await fetchInvoices();
      if (data.success) setInvoices(data.invoices);
    } catch (error) {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, []);

  const totalEarned = useMemo(() => 
    invoices.filter((inv) => inv.status === "Paid")
      .reduce((sum, inv) => sum + inv.total, 0),
    [invoices]
  );

  const totalPending = useMemo(() =>
  invoices.filter((inv) => inv.status === "Sent")
    .reduce((sum, inv) => sum + inv.total, 0),
  [invoices]
  );

  const totalOverdue = useMemo(() =>
    invoices.filter((inv) => inv.status === "Overdue")
      .reduce((sum, inv) => sum + inv.total, 0),
    [invoices]
  );

  const monthlyData = useMemo(() => 
    invoices.reduce((acc, inv) => {
    const month = new Date(inv.createdAt).toLocaleString("en-IN", {
      month: "short",
    });
    const existing = acc.find((item) => item.month === month);
    if (existing) {
      if (inv.status === "Paid") existing.earned += inv.total;
      if (inv.status === "Sent") existing.pending += inv.total;
      if (inv.status === "Overdue") existing.overdue += inv.total;
      existing.count += 1;
    } else {
      acc.push({
        month,
        earned: inv.status === "Paid" ? inv.total : 0,
        pending: inv.status === "Sent" ? inv.total : 0,
        overdue: inv.status === "Overdue" ? inv.total : 0,
        count: 1,
      });
    }
    return acc;
  }, []),
  [invoices]);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <>
      <div className="page-header">
        <h2>Welcome back, {user?.name} 👋</h2>
        <p>Here's your business overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card earned">
          <p className="stat-label">Total Earned</p>
          <h3 className="stat-value">{formatCurrency(totalEarned)}</h3>
        </div>
        <div className="stat-card pending">
          <p className="stat-label">Pending</p>
          <h3 className="stat-value">{formatCurrency(totalPending)}</h3>
        </div>
        <div className="stat-card overdue">
          <p className="stat-label">Overdue</p>
          <h3 className="stat-value">{formatCurrency(totalOverdue)}</h3>
        </div>
        <div className="stat-card total">
          <p className="stat-label">Total Invoices</p>
          <h3 className="stat-value">{invoices.length}</h3>
        </div>
      </div>

      <div className="chart-section">
        <h3>Monthly Revenue</h3>
        <div className="chart-wrapper">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData} barGap={10}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name) => [formatCurrency(value), name]}
                  itemSorter={(item) => {
                    const order = { Earned: 0, Pending: 1, Overdue: 2 };
                    return order[item.name];
                  }}
                />
                <Legend
                  payload={[
                    { value: "Earned", type: "square", color: "#6c63ff" },
                    { value: "Pending", type: "square", color: "#74b9ff" },
                    { value: "Overdue", type: "square", color: "#ff7675" },
                  ]}
                />
                <Bar
                  dataKey="earned"
                  name="Earned"
                  fill="#6c63ff"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="pending"
                  name="Pending"
                  fill="#74b9ff"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="overdue"
                  name="Overdue"
                  fill="#ff7675"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart">
              No data yet. Create your first invoice.
            </div>
          )}
        </div>
      </div>

      <div className="recent-section">
        <h3>Recent Invoices</h3>
        {invoices.length === 0 ? (
          <p className="empty-text">No invoices yet.</p>
        ) : (
          <table className="invoice-table">
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
              {invoices.slice(0, 5).map((inv) => (
                <tr key={inv._id}>
                  <td>{inv.invoiceNumber}</td>
                  <td>{inv.clientId?.name || "N/A"}</td>
                  <td>{formatCurrency(inv.total)}</td>
                  <td>{formatDate(inv.dueDate)}</td>
                  <td>
                    <span
                      className={`status-badge ${inv.status.toLowerCase()}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default Dashboard;
