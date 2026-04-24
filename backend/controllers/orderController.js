import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.resolve("data.json");

// Helper to initialize or read DB
async function getOrders() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    if (err.code === "ENOENT") {
      await fs.writeFile(DATA_FILE, JSON.stringify([]));
      return [];
    }
    throw err;
  }
}

// Helper to save DB
async function saveOrders(orders) {
  await fs.writeFile(DATA_FILE, JSON.stringify(orders, null, 2));
}

function getMonthName(date) {
  const d = new Date(date);
  return d.toLocaleString("default", { month: "long", year: "numeric" });
}

// Create
export const createOrder = async (req, res) => {
  try {
    const { customerName, phone, frameSize, quantity, price, advance, date } = req.body;

    if (!customerName || !frameSize || !price || !date)
      return res.status(400).json({ error: "Missing fields" });

    const month = getMonthName(date);
    const advanceVal = Number(advance) || 0;
    const priceVal = Number(price) || 0;
    
    const newOrder = {
      _id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      customerName,
      phone: phone || "",
      frameSize,
      quantity,
      price: priceVal,
      advance: advanceVal,
      balance: ((Number(quantity) || 1) * priceVal) - advanceVal,
      isPaid: false,
      date,
      month,
      createdAt: new Date().toISOString()
    };

    const orders = await getOrders();
    orders.push(newOrder);
    await saveOrders(orders);

    res.status(201).json({ ...newOrder, id: newOrder._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all
export const getAllOrders = async (req, res) => {
  try {
    const orders = await getOrders();
    
    // sort desc by createdAt
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const grouped = {};
    orders.forEach((o) => {
      if (!grouped[o.month]) grouped[o.month] = [];
      grouped[o.month].push({ ...o, id: o._id });
    });

    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
export const deleteOrder = async (req, res) => {
  try {
    let orders = await getOrders();
    orders = orders.filter(o => o._id !== req.params.id);
    await saveOrders(orders);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
export const updateOrder = async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.date) update.month = getMonthName(update.date);

    let orders = await getOrders();
    const index = orders.findIndex(o => o._id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    orders[index] = { ...orders[index], ...update };
    orders[index].balance = ((Number(orders[index].quantity) || 1) * (Number(orders[index].price) || 0)) - (Number(orders[index].advance) || 0);

    await saveOrders(orders);

    res.json({ ...orders[index], id: orders[index]._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
