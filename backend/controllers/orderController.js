import Order from "../models/Order.js";

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
    
    const paymentHistory = [];
    if (advanceVal > 0) {
      paymentHistory.push({
        date: new Date().toISOString().split("T")[0],
        amount: advanceVal
      });
    }
    
    const balance = ((Number(quantity) || 1) * priceVal) - advanceVal;

    const newOrder = await Order.create({
      customerName,
      phone: phone || "",
      frameSize,
      quantity,
      price: priceVal,
      advance: advanceVal,
      balance: balance,
      isPaid: balance <= 0,
      date,
      month,
      paymentHistory
    });

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    const grouped = {};
    orders.forEach((o) => {
      if (!grouped[o.month]) grouped[o.month] = [];
      grouped[o.month].push(o);
    });

    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
export const deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
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

    const currentOrder = await Order.findById(req.params.id);
    
    if (!currentOrder) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    // Handle partial payment addition
    if (update.addPayment) {
      const paymentAmount = Number(update.addPayment);
      if (paymentAmount > 0) {
        currentOrder.paymentHistory.push({
          date: new Date().toISOString().split("T")[0],
          amount: paymentAmount
        });
        currentOrder.advance = (Number(currentOrder.advance) || 0) + paymentAmount;
      }
      delete update.addPayment; // Remove from generic update
    }

    // Apply other updates
    Object.assign(currentOrder, update);
    
    const calculatedBalance = ((Number(currentOrder.quantity) || 1) * (Number(currentOrder.price) || 0)) - (Number(currentOrder.advance) || 0);
    currentOrder.balance = calculatedBalance;
    
    // Automatically mark as paid if balance is 0 or less
    if (calculatedBalance <= 0) {
      currentOrder.isPaid = true;
    }

    await currentOrder.save();

    res.json(currentOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

