import express from "express";
import {
  createOrder,
  getAllOrders,
  deleteOrder,
  updateOrder
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/", getAllOrders);
router.delete("/:id", deleteOrder);
router.put("/:id", updateOrder);

export default router;
