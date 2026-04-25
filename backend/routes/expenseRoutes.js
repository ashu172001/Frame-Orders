import express from "express";
import {
  createExpense,
  getAllExpenses,
  deleteExpense
} from "../controllers/expenseController.js";

const router = express.Router();

router.post("/", createExpense);
router.get("/", getAllExpenses);
router.delete("/:id", deleteExpense);

export default router;
