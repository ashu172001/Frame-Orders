import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./OrderTable.css"; // Reuse the same styles

const API_BASE = "https://frame-orders-1.onrender.com/api/expenses";

const Expenses = () => {
  const [expenses, setExpenses] = useState({});
  const [expandedMonth, setExpandedMonth] = useState(null);
  const [expandedYear, setExpandedYear] = useState(null);

  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: ""
  });

  const toggleMonth = (month) => {
    setExpandedMonth((prev) => (prev === month ? null : month));
  };

  const toggleYear = (year) => {
    setExpandedYear((prev) => (prev === year ? null : year));
  };

  const handleDownloadPDF = (month, data) => {
    const doc = new jsPDF();
    doc.text(`Expenses - ${month}`, 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["Date", "Description", "Amount"]],
      body: data.map((e) => [
        new Date(e.date).toLocaleDateString("en-IN"),
        e.description,
        e.amount,
      ]),
    });

    const finalY = doc.lastAutoTable.finalY || 25;
    const monthTotalAmount = data.reduce((s, e) => s + (Number(e.amount) || 0), 0);

    doc.setFontSize(11);
    doc.text(
      `Total Expenses for ${month}: Rs. ${monthTotalAmount.toLocaleString("en-IN")}`, 
      14, 
      finalY + 10
    );

    doc.save(`${month}_Expenses.pdf`);
  };

  const fetchExpenses = async () => {
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewExpense((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdd = async () => {
    if (!newExpense.description || !newExpense.amount) {
      alert("Please fill in all required fields!");
      return;
    }

    try {
      await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExpense),
      });

      setNewExpense({
        date: new Date().toISOString().split("T")[0],
        description: "",
        amount: ""
      });

      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      fetchExpenses();
    }
  };

  const allExpenses = Object.values(expenses).flat();
  const totalExpenses = allExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const currentYear = new Date().getFullYear().toString();

  const groupedByYear = {};
  Object.entries(expenses).forEach(([monthLabel, monthExpenses]) => {
    const parts = monthLabel.split(" ");
    const year = parts[parts.length - 1]; // e.g. "2026"
    if (!groupedByYear[year]) {
      groupedByYear[year] = {};
    }
    groupedByYear[year][monthLabel] = monthExpenses;
  });

  const sortedYears = Object.keys(groupedByYear).sort((a, b) => b - a);

  const renderMonthSection = (month, monthExpenses) => {
    const monthTotalAmount = monthExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const open = expandedMonth === month;

    return (
      <div key={month} className="month-section">
        <div className="month-header" onClick={() => toggleMonth(month)}>
          <h3>
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '24px', height: '24px', color: '#ef4444'}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            {month}
          </h3>

          <div className="download-buttons">
            <button className="btn-secondary" onClick={(e) => { e.stopPropagation(); handleDownloadPDF(month, monthExpenses); }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '18px', height: '18px', color: '#ef4444'}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              PDF
            </button>
          </div>
        </div>

        {open && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {monthExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", fontStyle: "italic", opacity: 0.6 }}>No expenses recorded yet.</td>
                  </tr>
                ) : (
                  monthExpenses.map((e) => (
                    <tr key={e.id}>
                      <td>{new Date(e.date).toLocaleDateString("en-IN")}</td>
                      <td>{e.description}</td>
                      <td style={{ color: '#ef4444', fontWeight: 'bold' }}>₹{e.amount.toLocaleString("en-IN")}</td>
                      <td>
                        <div className="actions-cell">
                          <button
                            className="action-icon delete"
                            title="Delete Expense"
                            onClick={() => handleDelete(e.id)}
                          >
                            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '18px', height: '18px'}}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="month-total">
              Total for {month}: Amount <span style={{ color: '#ef4444' }}>₹{monthTotalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="order-table-container">
      <h2>
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '36px', height: '36px', color: '#ef4444', marginRight: '10px'}}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        Expense Tracking
      </h2>

      <div className="summary-cards" style={{ gridTemplateColumns: 'repeat(1, 1fr)', maxWidth: '300px', margin: '0 auto 2rem auto' }}>
        <div className="summary-card" style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}>
          <p>Total Expenses</p>
          <h3 style={{ color: '#ef4444' }}>₹{totalExpenses.toLocaleString("en-IN")}</h3>
        </div>
      </div>

      <div className="input-row" style={{ justifyContent: 'center' }}>
        <div className="input-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={newExpense.date}
            onChange={handleChange}
          />
        </div>
        <div className="input-group" style={{ flex: 1, maxWidth: '400px' }}>
          <label>Description</label>
          <input
            type="text"
            name="description"
            placeholder="e.g. Bought glass, Rent, Electricity..."
            value={newExpense.description}
            onChange={handleChange}
          />
        </div>
        <div className="input-group">
          <label>Amount (₹)</label>
          <input
            type="number"
            name="amount"
            placeholder="0"
            value={newExpense.amount}
            onChange={handleChange}
          />
        </div>
        <button className="btn-primary" onClick={handleAdd} style={{ alignSelf: 'flex-end', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' }}>
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width: '20px', height: '20px'}}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Expense
        </button>
      </div>

      <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '2rem 0' }} />

      {sortedYears.map((year) => {
        const isCurrentYear = year === currentYear;
        const yearMonths = groupedByYear[year];

        if (isCurrentYear) {
          // Render current year's months directly
          return Object.entries(yearMonths).map(([month, monthExpenses]) => 
            renderMonthSection(month, monthExpenses)
          );
        } else {
          // Render past years as folders
          const openYear = expandedYear === year;
          const totalExpensesYear = Object.values(yearMonths).flat().reduce((s, e) => s + (Number(e.amount) || 0), 0);

          return (
            <div key={year} className="year-section" style={{ marginBottom: '30px' }}>
              <div 
                className="month-header" 
                style={{ background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.02) 100%)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                onClick={() => toggleYear(year)}
              >
                <h3>
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '24px', height: '24px', color: '#ef4444'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0A2.25 2.25 0 001.5 12v6a2.25 2.25 0 002.25 2.25h16.5A2.25 2.25 0 0022.5 18v-6a2.25 2.25 0 00-1.5-2.224m-16.5 0V6a2.25 2.25 0 012.25-2.25h12A2.25 2.25 0 0119.5 6v3.776M12 15h.008v.008H12v-.008z" />
                  </svg>
                  {year} Archive Folder
                  <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'normal', marginLeft: '10px' }}>
                    (₹{totalExpensesYear.toLocaleString("en-IN")})
                  </span>
                </h3>

                <div className="download-buttons">
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width: '20px', height: '20px', color: 'var(--text-muted)'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" style={{ transform: openYear ? 'rotate(180deg)' : 'none', transformOrigin: 'center', transition: 'transform 0.3s' }} />
                  </svg>
                </div>
              </div>

              {openYear && (
                <div className="year-contents" style={{ paddingLeft: '15px', borderLeft: '2px solid rgba(239, 68, 68, 0.2)', marginLeft: '10px', marginTop: '15px' }}>
                  {Object.entries(yearMonths).map(([month, monthExpenses]) => 
                    renderMonthSection(month, monthExpenses)
                  )}
                </div>
              )}
            </div>
          );
        }
      })}
    </div>
  );
};

export default Expenses;
