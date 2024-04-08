import { NextFunction, Request, Response } from "express";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";
import Task from "../schema/Task";
import Technician from "../schema/Technician";
import Expense from "../schema/Expense";
import CompanyBranch from "../schema/CompanyBranch";
import Driver from "../schema/Driver";

export const createExpense = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body;

  // @ts-ignore
  const id = req.user._id;

  const expense = await CompanyBranch.findOne({ _id: payload.branchId });
  if (!expense) {
    throw createHttpError(400, createHttpError("Driver doesn't exists"));
  }

  const createdExpense = await Expense.create({ ...payload, createdBy: id });

  if (!createdExpense) {
    throw createHttpError(400, "Expense is not created!");
  }

  res.send(createResponse(createExpense, "Expense created successfully!"));
};

export const getExpense = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { page, limit } = req.query;
  let page1 = parseInt(page as string) || 1;
  let limit1 = parseInt(limit as string) || 10;

  const startIndex = (page1 - 1) * limit1;

  let data = await Task.find({ deleted: false })
    .sort({ createdAt: -1 })
    .limit(limit1)
    .skip(startIndex);

  const totalCount = await Task.countDocuments({ deleted: false });

  res.send(createResponse({ data, totalCount }));
};

export const getExpenseById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;

  const data = await Expense.findOne({ _id: id, deleted: false });

  if (!data) {
    res.send(createHttpError(404, "Not found"));
  } else {
    res.send(createResponse(data));
  }
};

export const deleteExpense = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;

  const task = await Expense.findOne({ _id: id, deleted: true });

  if (task) {
    res.send(createHttpError(404, "Not found"));
    return;
  }

  const deletedExpense = await Task.updateOne({ _id: id }, { deleted: true });

  res.send(createResponse(deletedExpense, "Expense Deleted successfully!"));
};

export const updateExpense = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  const payload = req.body;

  const expense = await Expense.findOne({ _id: id });

  if (!expense) {
    throw createHttpError(404, "Not found");
  }

  if (payload.branchId) {
    const branchExists = await CompanyBranch.findById(payload.branchId);
    if (!branchExists) {
      throw createHttpError(404, "Branch doesn't exists");
    }
  }

  const updatedExpense = await Expense.updateOne({ _id: id }, payload);

  res.send(
    createResponse(updatedExpense, "Expense has been updated successfully!")
  );
};
