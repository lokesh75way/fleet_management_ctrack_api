import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import Driver from "../schema/Driver";
import { createResponse } from "../helper/response";
import mongoose from "mongoose";

export const createDriver = async (req: Request, res: Response) => {
  const data = req.body;
  const newDriver = await Driver.create(data);
  res.send(createResponse(newDriver, "New driver added successfully!"));
};

export const updateDriver = async (req: Request, res: Response) => {
  const data = req.body;
  const { id } = req.params;

  const newDriver = await Driver.findOneAndUpdate({ _id: id }, data, {
    returnDocument: "after",
  });
  if (newDriver == null)
    throw createHttpError(404, { message: "No driver found" });

  res.send(createResponse(newDriver, "Driver date updated successfully!"));
};

export const getDriver = async (req: Request, res: Response) => {
  const { id } = req.params;

  const driver = await Driver.findOne({ _id: id })
    .populate("companyId")
    .populate("branchId")
    .populate("businessGroupId");
  if (driver == null)
    throw createHttpError(404, { message: "No driver found" });

  res.send(createResponse({ driver }, "One driver found!"));
};

export const deleteDrivers = async (req: Request, res: Response) => {
  const { driverIds } = req.body;
  let filter = {
    _id: {
      $in: driverIds.map((id: string) => new mongoose.Types.ObjectId(id)),
    },
  };

  const drivers = await Driver.deleteMany(filter);
  if (drivers.deletedCount === 0)
    throw createHttpError(404, { message: "No driver found" });

  res.send(createResponse({}, "Drivers deleted successfully!"));
};
