import Expense from "../models/Expense.js";

function getMonthName(date) {
  const d = new Date(date);
  return d.toLocaleString("default", { month: "long", year: "numeric" });
}

// Create
export const createExpense = async (req, res) => {
  try {
    const { description, amount, date } = req.body;

    if (!description || !amount || !date) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const month = getMonthName(date);

    const newExpense = await Expense.create({
      description,
      amount: Number(amount),
      date,
      month
    });

    res.status(201).json(newExpense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all
export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });

    const grouped = {};
    expenses.forEach((e) => {
      const month = e.month || getMonthName(e.date); // Fallback for old data
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(e);
    });

    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
export const deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

