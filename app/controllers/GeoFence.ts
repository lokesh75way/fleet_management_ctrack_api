import { NextFunction, Request, Response } from "express";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";
import User, { UserRole } from "../schema/User";
import Company from "../schema/Company";
import Geofence from "../schema/Geofence";

export const createGeofence = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body;

  // @ts-ignore
  const id = req.user._id;

  const companyExists = await Company.findOne({ _id: payload.company });
  if (!companyExists) {
    throw createHttpError(404, "company doesn't exist!");
  }

  const geoFence = await Geofence.create({ ...payload, createdBy: id });

  if (!geoFence) {
    res.send(createHttpError(400, "GeoFence is not created"));
    return;
  }

  res.send(createResponse(geoFence, "GeoFence created successfully!"));
};

export const getGeofence = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req.user._id;
  // @ts-ignore
  const role = req.user.role;

  const query: any = { deleted: false };
  if (role === UserRole.COMPANY) {
    const companyId = await User.findById(userId);

    if (companyId) {
      query["$or"] = [{ createdBy: userId }, { company: companyId.companyId }];
    }
  }

  let companies;
  if (role === UserRole.BUSINESS_GROUP) {
    const businessGroupId = await User.findOne({ _id: userId }).select(
      "businessGroupId"
    );
    if (businessGroupId) {
      companies = await Company.find({
        businessGroupId: businessGroupId.businessGroupId,
      }).select("_id");
    }

    const companyIds = companies?.map((company) => company._id);
    query["company"] = { $in: [companyIds] };
  }

  const page = parseInt((req.query.page as string) || "1");
  const limit = parseInt((req.query.limit as string) || "10");

  const startIndex = (page - 1) * limit;

  const geofences = await Geofence.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  const count = await Geofence.countDocuments(query);

  res.send(createResponse({ geofences, count }));
};

export const getGeofenceById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;

  const geoFence = await Geofence.findOne({ _id: id, deleted: false });
  res.send(createResponse(geoFence));
};

export const deleteGeofence = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;

  const geofence = await Geofence.findOne({ _id: id, deleted: true });

  if (geofence) {
    throw createHttpError(404, "Not found");
  }

  const deletedGeofence = await Geofence.updateOne(
    { _id: id },
    { deleted: true }
  );

  res.send(createResponse(deletedGeofence, "Task Deleted successfully!"));
};

export const updateGeofence = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  const payload = req.body;

  let geofence = await Geofence.findOne({ _id: id , deleted : false });

  if (!geofence) {
    res.send(createHttpError(404, "Not found"));
    return;
  }

  const updatedGeofence = await Geofence.updateOne({ _id: id }, payload);

  res.send(createResponse(updatedGeofence, "Geofence updated successfully!"));
};
