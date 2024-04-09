import { Request, Response } from "express";
import createHttpError from "http-errors";
import Driver, { IDriver } from "../schema/Driver";
import { createResponse } from "../helper/response";
import mongoose from "mongoose";
import User, { UserRole } from "../schema/User";

export const createDriver = async (req: Request, res: Response) => {
  const data = req.body as IDriver;
  // @ts-ignore
  const id = req.user._id;
  // @ts-ignore
  const role = req.user.role;
  const user = await User.findById(id).select("companyId businessGroupId");
  if (role === UserRole.COMPANY && data.companyId != user?.companyId) {
    throw createHttpError(401, { message: "Unauthorize access!" });
  }

  if (
    role === UserRole.BUSINESS_GROUP &&
    data.businessGroupId != user?.businessGroupId
  ) {
    throw createHttpError(401, { message: "Unauthorize access!" });
  }

  const newDriver = await Driver.create(data);
  res.send(createResponse(newDriver, "Driver added successfully!"));
};

export const updateDriver = async (req: Request, res: Response) => {
  const data = req.body;
  const { id } = req.params;
  // @ts-ignore
  const userId = req.user._id;
  // @ts-ignore
  const role = req.user.role;
  let query: mongoose.FilterQuery<IDriver> = { _id: id, isDeleted: false };
  const user = await User.findById(id).select("companyId businessGroupId");
  if (role === UserRole.COMPANY) {
    query.companyId = user?.companyId;
  }
  if (role === UserRole.BUSINESS_GROUP) {
    query.businessGroupId = user?.businessGroupId;
  }

  const newDriver = await Driver.findOneAndUpdate(query, data, {
    returnDocument: "after",
  });
  if (newDriver == null)
    throw createHttpError(404, { message: "No driver found" });

  res.send(createResponse(newDriver, "Driver date updated successfully!"));
};

export const getDriver = async (req: Request, res: Response) => {
  const { id } = req.params;
  // @ts-ignore
  const userId = req.user._id;
  // @ts-ignore
  const role = req.user.role;
  let query: mongoose.FilterQuery<IDriver> = { _id: id, isDeleted: false };
  const user = await User.findById(id).select("companyId businessGroupId");
  if (role === UserRole.COMPANY) {
    query.companyId = user?.companyId;
  }
  if (role === UserRole.BUSINESS_GROUP) {
    query.businessGroupId = user?.businessGroupId;
  }

  const driver = await Driver.findOne(query)
    .populate("companyId")
    .populate("branchId")
    .populate("businessGroupId");
  if (driver == null)
    throw createHttpError(404, { message: "No driver found" });

  res.send(createResponse(driver, "One driver found!"));
};

export const deleteDrivers = async (req: Request, res: Response) => {
  const { driverIds } = req.body;
  // @ts-ignore
  const id = req.user._id;
  // @ts-ignore
  const role = req.user.role;
  let filter: mongoose.FilterQuery<IDriver> = {
    _id: {
      $in: driverIds.map((id: string) => new mongoose.Types.ObjectId(id)),
    },
  };

  const user_id = await User.findById(id).select("companyId businessGroupId");
  if (role === UserRole.COMPANY) {
    filter.companyId = user_id?.companyId;
  }

  if (role === UserRole.BUSINESS_GROUP) {
    filter.businessGroupId = user_id?.businessGroupId;
  }

  const drivers = await Driver.deleteMany(filter);
  if (drivers.deletedCount === 0)
    throw createHttpError(404, { message: "No driver found" });

  res.send(createResponse({}, "Drivers deleted successfully!"));
};

export const getAllDrivers = async (req: Request, res: Response) => {
  // @ts-ignore
  const id = req.user._id;
  // @ts-ignore
  const role = req.user.role;
  let query: mongoose.FilterQuery<IDriver> = { isDeleted: false };

  let { page, limit } = req.query;
  let page1 = parseInt(page as string) || 1;
  let limit1 = parseInt(limit as string) || 10;

  const startIndex = (page1 - 1) * limit1;

  const user_id = await User.findById(id).select("companyId businessGroupId");
  if (role === UserRole.COMPANY) {
    query.companyId = user_id?.companyId;
  }

  if (role === UserRole.BUSINESS_GROUP) {
    query.businessGroupId = user_id?.businessGroupId;
  }

  const data = await Driver.find(query)
    .populate("companyId")
    .populate("branchId")
    .populate("businessGroupId")
    .limit(limit1)
    .skip(startIndex);

    const totalCount = await Driver.countDocuments(query);

    res.send(createResponse({ data, totalCount }, "All drivers"));
};
