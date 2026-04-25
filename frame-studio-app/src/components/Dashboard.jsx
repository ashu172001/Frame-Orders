import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "./OrderTable.css";

const API_ORDERS = "https://frame-orders-1.onrender.com/api/orders";
const API_EXPENSES = "https://frame-orders-1.onrender.com/api/expenses";

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, expensesRes] = await Promise.all([
          fetch(API_ORDERS),
          fetch(API_EXPENSES)
        ]);
        
        const ordersData = await ordersRes.json();
        const expensesData = await expensesRes.json();

        // Orders API returns grouped by month, so we flat it out
        const allOrders = Object.values(ordersData).flat();
        setOrders(allOrders);
        setExpenses(expensesData);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };
    fetchData();
  }, []);

  // --- Calculations ---

  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Total Orders
  const totalOrders = orders.length;

  // 2. Advance Paid
  const totalAdvancePaid = orders.reduce((sum, o) => sum + (Number(o.advance) || 0), 0);

  // 3. Pending Balance
  const totalPendingBalance = orders.reduce((sum, o) => {
    if (o.isPaid) return sum;
    const b = o.balance !== undefined ? o.balance : ((o.quantity * o.price) - (Number(o.advance) || 0));
    return sum + Number(b);
  }, 0);

  // 4. Total Expenses
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // 5. Total Amount (Actual cash collected)
  const totalAmount = orders.reduce((sum, o) => {
    if (o.isPaid || o.balance <= 0) {
      return sum + (o.quantity * o.price);
    }
    return sum + (Number(o.advance) || 0);
  }, 0);

  // 6. Best Sellers
  const frameCounts = {};
  orders.forEach(o => {
    const size = o.frameSize;
    if (!frameCounts[size]) frameCounts[size] = 0;
    frameCounts[size] += o.quantity;
  });

  const bestSellers = Object.entries(frameCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // top 5

  // 7. Chart Data (Last 7 Days Sales - Actual Cash Collected)
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    
    // Sum cash collected for this date
    const dailySales = orders
      .filter(o => o.date === dateStr)
      .reduce((sum, o) => {
        if (o.isPaid || o.balance <= 0) {
          return sum + (o.quantity * o.price);
        }
        return sum + (Number(o.advance) || 0);
      }, 0);
      
    chartData.push({
      date: dateStr.slice(5), // MM-DD
      sales: dailySales
    });
  }

  return (
    <div className="order-table-container">
      <h2>
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '36px', height: '36px', color: '#8b5cf6', marginRight: '10px'}}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
        Business Analytics Dashboard
      </h2>

      {/* Summary Cards */}
      <div className="summary-cards" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="summary-card">
          <p>Total Orders</p>
          <h3 style={{ color: '#fff' }}>{totalOrders}</h3>
        </div>
        <div className="summary-card" style={{ borderColor: 'rgba(56, 189, 248, 0.4)' }}>
          <p>Advance Paid</p>
          <h3 style={{ color: '#38bdf8' }}>₹{totalAdvancePaid.toLocaleString("en-IN")}</h3>
        </div>
        <div className="summary-card" style={{ borderColor: 'rgba(245, 158, 11, 0.4)' }}>
          <p>Pending Balance</p>
          <h3 style={{ color: '#f59e0b' }}>₹{totalPendingBalance.toLocaleString("en-IN")}</h3>
        </div>
        <div className="summary-card" style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}>
          <p>Total Expenses</p>
          <h3 style={{ color: '#ef4444' }}>₹{totalExpenses.toLocaleString("en-IN")}</h3>
        </div>
        <div className="summary-card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)', borderColor: '#10b981' }}>
          <p>Total Amount</p>
          <h3 style={{ color: '#10b981' }}>₹{totalAmount.toLocaleString("en-IN")}</h3>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
        
        {/* Chart Section */}
        <div className="month-section" style={{ flex: '2', minWidth: '400px', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#fff', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width: '20px', height: '20px', color: '#38bdf8'}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
            Sales (Last 7 Days)
          </h3>
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Bar dataKey="sales" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best Sellers Section */}
        <div className="month-section" style={{ flex: '1', minWidth: '250px', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#fff', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width: '20px', height: '20px', color: '#f59e0b'}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            Best Sellers (Qty)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bestSellers.length === 0 ? (
              <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No sales data yet.</p>
            ) : (
              bestSellers.map((item, index) => (
                <div key={item[0]} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <span style={{ color: '#fff', fontWeight: '500' }}>
                    <span style={{ color: '#94a3b8', marginRight: '8px' }}>#{index + 1}</span>
                    {item[0]}
                  </span>
                  <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '2px 8px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {item[1]} sold
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
