import { NextFunction, Request, Response } from "express";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";
import User, { UserRole, UserType } from "../schema/User";
import Vehicle from "../schema/Vehicle";
import { v2 as cloudinary } from "cloudinary";

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
      res.send(createHttpError(404, "Company doesn't not exist"));
    }

    const existingVehicle = await Vehicle.findOne({plateNumber : req.body.plateNumber});

    if(existingVehicle){
      res.send(createHttpError(409,"Vehicle with this plate number already exists"));
      return;
    }

    const vehicle = await Vehicle.create(req.body);

    const newUser = await User.updateOne(
      {
        _id: id,
      },
      { $push: { vehicleIds: vehicle._id } }
    );

    if (!newUser) {
      res.send(createHttpError(400, "User is not updated"));
    }

    const populatedVehicle = await vehicle.populate([{path : "businessGroupId" , select : "groupName"},{path : "companyId" , select : "companyName"}])

    res.send(createResponse(populatedVehicle, "Vehicle has been created successfully!"));
  } catch (error: any) {
    throw createHttpError(400, {
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
    console.log(role);
    let query: any = { isDeleted: false };

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
