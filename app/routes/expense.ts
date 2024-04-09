import express from "express";
import { catchError, validate } from "../middleware/validation";
import asyncHandler from "express-async-handler";
import { createExpense, deleteExpense, getExpense, getExpenseById, updateExpense } from "../controllers/Expense";

const router = express.Router();

router.post("/",validate('expense:add'),catchError,asyncHandler(createExpense));

router.get("/",asyncHandler(getExpense));

router.get("/:id",asyncHandler(getExpenseById))

router.delete("/:id",asyncHandler(deleteExpense))

router.patch("/:id",validate('expense:update'),catchError,asyncHandler(updateExpense))

export default router;