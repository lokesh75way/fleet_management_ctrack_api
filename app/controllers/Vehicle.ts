import { NextFunction, Request, Response } from "express";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";
import User, { UserRole, UserType } from "../schema/User";
import Vehicle from "../schema/Vehicle";
import { v2 as cloudinary } from "cloudinary";
import TrakingHistory from "../schema/TrakingHistory";
import Company from "../schema/Company";
import mongoose from "mongoose";
import UnassignedVehicle from "../schema/UnassignedVehicle";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const createVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const id = req.user._id;
    const alreadyExists = await User.findById(id);
    if (!alreadyExists) {
      throw createHttpError(400, {
        message: "Company doesn't not exist",
        data: { user: null },
      });
    }

    if (req.body.registrationNumber) {
      const existingVehicle = await Vehicle.findOne({
        registrationNumber: req.body.registrationNumber,
        isDeleted: false,
      });
  
      if (existingVehicle) {
        throw createHttpError(400, {
          message: `Vehicle with this Registration number already exists`,
          data: { user: null },
        });
      }
    }

    // Temproary check take imei only from traking table
    const existingImeiExist = await TrakingHistory.findOne({
      imeiNumber: req.body.imeiNumber,
    });

    if (!existingImeiExist) {
      throw createHttpError(400, {
        message: `Invalid imei number! Please enter valid imei number!`,
        data: { user: null },
      });
    }

    const existingVehicleImei = await Vehicle.findOne({
      imeiNumber: req.body.imeiNumber,
      isDeleted: false,
    });

    if (existingVehicleImei) {
      throw createHttpError(400, {
        message: `Device with this imei already exist!`,
        data: { user: null },
      });
    }

    const vehicle = await Vehicle.create(req.body);

    const newUser = await User.updateOne(
      {
        _id: id,
      },
      { $push: { vehicleIds: vehicle._id } }
    );

    const updateVehicleAssigned = await UnassignedVehicle.updateOne(
      { imeiNumber: req.body.imeiNumber },
      { isVehicleAssigned: true }
    );

    if (!newUser) {
      res.send(createHttpError(400, "User is not updated"));
    }

    const populatedVehicle = await vehicle.populate([
      { path: "businessGroupId", select: "groupName" },
      { path: "companyId", select: "companyName" },
    ]);

    res.send(
      createResponse(populatedVehicle, "Vehicle has been created successfully!")
    );
  } catch (error: any) {
    throw createHttpError(error.status || 400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};

export const updateVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const payload = req.body;

    const exist = await Vehicle.findOne({ _id: id });

    if (!exist) {
      res.send(createHttpError(404, "Vehicle doesn't exists"));
    }

    await Vehicle.findOneAndUpdate({ _id: id }, payload);

    res.send(createResponse({}, "Vehicle has been updated successfully!"));
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};

export const getVehicles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const id = req.user._id;
    // @ts-ignore
    const role = req.user.role;
    let query: any = { isDeleted: false };
    let { page, limit, branchIds, companyId } = req.query;
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
    if (companyId) {
      query.companyId = companyId;
    }
    if (branchIds) {
      const branchIdsArray = Array.isArray(branchIds) ? branchIds : [branchIds];
      query.branchId = { $in: branchIdsArray };
    }
    const data = await Vehicle.find(query)
      .populate("branchId")
      .sort({ createdAt: -1 })
      .limit(limit1)
      .skip(startIndex);
    const totalCount = await Vehicle.countDocuments(query);
    res.send(createResponse({ data, totalCount }));
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};

export const deleteVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      res.send(createHttpError(404, "vehicle is not exists"));
    }
    if (vehicle?.isDeleted) {
      res.send(createHttpError(404, "vehicle is already deleted"));
    }
    await Vehicle.updateOne({ _id: id }, { isDeleted: true });

    const updateVehicleAssigned = await UnassignedVehicle.updateOne(
      { imeiNumber: vehicle?.imeiNumber },
      { isVehicleAssigned: false }
    );
    res.send(createResponse({}, "Vehicle has been deleted successfully."));
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};

export const fileUploader = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const file: any = req.files?.file;
    if (!file) return next(createHttpError(404, "File not found."));
    if (file?.tempFilePath) {

      const result = await cloudinary?.uploader.upload(file?.tempFilePath);
      res.send(
        createResponse(
          { link: result?.secure_url },
          "File uploaded successfully"
        )
      );
      return;
    }
    res.send(createResponse({}, "File is not uploaded"));
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};

type LatLongStringType = {
  Latitude: string;
  Longitude: string;
};

type LatLongNumberType = {
  latitude: number;
  longitude: number;
};

/**
 * Api to get vahicle current(last) status
 * @param { id, status } req.query
 * @param { data[] } res
 * @param next
 */
export const getVehicleTrackings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const status = req.query.status;
    const ids = req.query.id as string[];

    let query: any = {};
    if (Array.isArray(ids) && ids.length > 0) {
      query["_id"] = { $in: ids };
    } else if (ids) {
      query["_id"] = ids;
    }

    const imeiIds = await Vehicle.find(query).select("imeiNumber");
    const imeiIdsArray = imeiIds.map((imei) => imei.imeiNumber);
    // const query2  :  any= { imeiNumber: { $in: imeiIdsArray }};

    const query2: any = {
      vehicleId: Array.isArray(ids)
        ? { $in: ids.map((id: string) => new mongoose.Types.ObjectId(id)) }
        : { $eq: new mongoose.Types.ObjectId(ids) },
    };

    let statusFilter = {};
    if (status && status != "") {
      statusFilter = { Status: { $eq: status } };
    }

    const trackData = await TrakingHistory.aggregate([
      {
        $match: query2,
      },
      {
        $match: {
          vehicleId: { $ne: null },
        },
      },
      {
        $sort: {
          updatedAt: -1,
        },
      },
      {
        $group: {
          _id: { vehicleId: "$vehicleId" },
          allFields: { $addToSet: "$$ROOT" },
        },
      },
      { $unwind: "$allFields" },
      {
        $sort: {
          "allFields.updatedAt": -1,
        },
      },
      {
        $group: {
          _id: "$_id",
          allFields: {
            $first: "$allFields",
          },
        },
      },
      {
        $addFields: {
          vehicleId: "$allFields.vehicleId",
        },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "vehicleId",
        },
      },
      { $unwind: "$vehicleId" },
      {
        $project: {
          _id: "$allFields._id",
          Status: "$allFields.Status",
          Vehicle_No: "$allFields.Vehicle_No",
          imeiNumber: "$allFields.imeiNumber",
          Vehicle_Name: "$allFields.Vehicle_Name",
          Latitude: "$allFields.Latitude",
          Longitude: "$allFields.Longitude",
          Location: "$allFields.Location",
          Datetime: "$allFields.Datetime",
          updatedAt: "$allFields.updatedAt",
          createdAt: "$allFields.createdAt",
          vehicleId: {
            _id: true,
            vehicleName: true,
          },
        },
      },
      {
        $facet: {
          data: [{ $match: statusFilter }],
          running: [{ $match: { Status: "RUNNING" } }, { $count: "count" }],
          stopped: [{ $match: { Status: "STOP" } }, { $count: "count" }],
          inactive: [{ $match: { Status: "INACTIVE" } }, { $count: "count" }],
          idle: [{ $match: { Status: "IDLE" } }, { $count: "count" }],
          total: [{ $count: "count" }],
        },
      },
    ]);

    function calculateCenterCoordinate(coordinates: LatLongNumberType[]) {
      const avgLat =
        coordinates?.reduce((acc, coord) => acc + coord.latitude, 0) /
        coordinates.length;
      const avgLng =
        coordinates?.reduce((acc, coord) => acc + coord.longitude, 0) /
        coordinates.length;
      return {
        latitude: parseFloat(avgLat.toFixed(5)),
        longitude: parseFloat(avgLng.toFixed(5)),
      };
    }

    const coordinates = trackData[0].data?.map((item: LatLongStringType) => ({
      latitude: parseFloat(item.Latitude),
      longitude: parseFloat(item.Longitude),
    }));

    const result = {
      data: trackData[0].data ?? [],
      count: {
        running: trackData[0]?.running[0]?.count ?? 0,
        stopped: trackData[0]?.stopped[0]?.count ?? 0,
        inactive: trackData[0]?.inactive[0]?.count ?? 0,
        idle: trackData[0]?.idle[0]?.count ?? 0,
        nodata: 0,
        total: trackData[0]?.total[0]?.count ?? 0,
      },
      centerCoordinate: calculateCenterCoordinate(coordinates),
    };

    res.send(createResponse(result));
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};

export const getCompanyVehicles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const id = req.user._id;
    // @ts-ignore
    const { role, type } = req.user;
    let query: any = { isDeleted: false };

    const { page, limit } = req.query;
    const pageNo = parseInt(page as string) || 1;
    const pageLimit = parseInt(limit as string) || 10;
    const startIndex = (pageNo - 1) * pageLimit;
    const search = req.query.search as string;

    const user_id = await User.findById(id).select(
      "companyId businessGroupId branchIds"
    );

    if (role === UserRole.COMPANY) {
      query = {
        $match: { _id: user_id?.companyId },
      };
    }

    if (role === UserRole.BUSINESS_GROUP) {
      query = {
        $match: { businessGroupId: user_id?.businessGroupId },
      };
    }

    if (role === UserRole.SUPER_ADMIN) {
      query = {
        $match: {},
      };
    }

    let branchFilter: any = {};

    if (role === UserRole.USER) {
      query = {
        $match: { _id: user_id?.companyId },
      };
      branchFilter = {
        branchId: {
          $in: user_id?.branchIds,
        },
      };
    }

    const data = await Company.aggregate([
      query,
      {
        $lookup: {
          from: "vehicles",
          let: { id: "$_id", ids: "$user_id.branchIds" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$companyId", "$$id"] },
              },
            },
            { $match: { isDeleted: false } },
            {
              $match: branchFilter,
            },
          ],
          as: "vehicles",
        },
      },
      {
        $match: {
          $or: [
            { companyName: { $regex: new RegExp(search, "i") } },
            { "vehicles.vehicleName": { $regex: new RegExp(search, "i") } },
          ],
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $project: {
          _id: true,
          companyName: true,
          vehicles: {
            _id: true,
            vehicleName: true,
          },
        },
      },
    ]);

    res.send(createResponse(data, "Company vehicle found successfully"));
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};

/**
 * GET UNASSINED VEHICLE'S
 * @param { page, limit } req.query
 * @param { data, totalCount} res
 */
export const getUnAssinedVehicles = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const { id, role } = req.user;
    let query: any = {};

    const { page, limit } = req.query;
    const pageNo = parseInt(page as string) || 1;
    const pageLimit = parseInt(limit as string) || 10;
    const startIndex = (pageNo - 1) * pageLimit;

    if (role !== UserRole.SUPER_ADMIN) {
      throw createHttpError(401, {
        message: `Unauthorize access`,
        data: { user: null },
      });
    }

    // query = {
    //   isVehicleAssigned: false,
    // };

    const totalCount = await UnassignedVehicle.countDocuments();
    const data = await UnassignedVehicle.find()
      .sort({ imeiNumber: 1 })
      .limit(pageLimit)
      .skip(startIndex);

    res.send(
      createResponse(
        {
          data,
          totalCount,
        },
        "Unassigned vehicle found succesfully!"
      )
    );
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};

export const getVehicleById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const id = req.user._id;
    // @ts-ignore
    const role = req.user.role;

    const vehicleId = req.params.id;
    if (!vehicleId) {
      throw createHttpError(400, { message: "Vehicle ID is required." });
    }

    let query: any = { isDeleted: false, _id: vehicleId };

    const user_id = await User.findById(id).select("companyId businessGroupId");

    if (role === UserRole.COMPANY) {
      query.companyId = user_id?.companyId;
    }
    if (role === UserRole.BUSINESS_GROUP) {
      query.businessGroupId = user_id?.businessGroupId;
    }

    const data = await Vehicle.findOne(query).populate("branchId");

    if (!data) {
      throw createHttpError(404, { message: "Vehicle not found." });
    }

    res.send(createResponse({ data }));
  } catch (error: any) {
    next(
      createHttpError(400, {
        message: error?.message ?? "An error occurred.",
        data: { user: null },
      })
    );
  }
};

