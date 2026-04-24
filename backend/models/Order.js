import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    phone: { type: String, default: "" },
    frameSize: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    price: { type: Number, required: true },
    advance: { type: Number, default: 0 },
    balance: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    date: { type: String, required: true },
    month: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("frameOrders", OrderSchema);
