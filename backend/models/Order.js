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
    month: { type: String, required: true },
    paymentHistory: [
      {
        date: String,
        amount: Number
      }
    ]
  },
  { timestamps: true }
);

// Map _id to id for the frontend
OrderSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    return ret;
  }
});

export default mongoose.model("frameOrders", OrderSchema);
