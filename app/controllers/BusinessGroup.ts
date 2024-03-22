import { NextFunction, Request, Response } from "express";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";
import BusinessGroup, { IBusinessGroup } from "../schema/BusinessGroup";
import User, { UserRole, UserType } from "../schema/User";

export const createBusinessUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.body;

    // @ts-ignore
    const id = req.user._id;
    const payloadUser = {
      userName: payload.userName,
      email: payload.email,
      password: payload.password,
      mobileNumber: payload.mobileNumber,
      country: payload.country,
      state: payload.state,
      role: UserRole.BUSINESS_GROUP,
      type: UserType.ADMIN,
    };
    const payloadGroup = { ...payload, createdBy: id };

    delete payloadGroup.email;
    delete payloadGroup.userName;
    delete payloadGroup.password;
    delete payloadGroup.mobileNumber;

    const alreadyExists = await User.findOne({
      $or: [
        { email: payload.email },
        { username: payload.userName },
        { mobileNumber: payload.mobileNumber },
      ],
    });

    if (alreadyExists) {
      res.send(createHttpError(409, "Business group already exists"));
    }
    const newBusinessGroup = await BusinessGroup.create({
      ...payloadGroup,
    });
    if (!newBusinessGroup) {
      res.send(createHttpError(400, "Business group is not created"));
    }
    const newUser = await User.create({
      ...payloadUser,
      businessGroupId: newBusinessGroup._id,
    });

    if (!newUser) {
      res.send(createHttpError(400, "User is not created"));
    }

    res.send(
      createResponse({}, "Business group has been created successfully!")
    );
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};

export const updateBusinessUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.body;

    // @ts-ignore
    const id = req.user._id;

    const payloadUser = {
      userName: payload.userName,
      email: payload.email,
      password: payload.password,
      mobileNumber: payload.mobileNumber,
      country: payload.country,
      state: payload.state,
      role: UserRole.BUSINESS_GROUP,
      type: UserType.ADMIN,
    };
    const payloadGroup = { ...payload };

    delete payloadGroup.email;
    delete payloadGroup.userName;
    delete payloadGroup.password;
    delete payloadGroup.mobileNumber;

    let alreadyExists = await User.findOne({
      $or: [{ email: payload.email }],
    });
    if (!alreadyExists) {
      res.send(
        createHttpError(404, "Business group with this email is not exists")
      );
      return;
    }

    const updatedFields: any = {};

    if (payloadUser.mobileNumber) {
      updatedFields.mobileNumber = payloadUser.mobileNumber;
    }
    if (payloadUser.country) {
      updatedFields.country = payloadUser.country;
    }
    if (payloadUser.userName) {
      updatedFields.userName = payloadUser.userName;
    }
    if (payloadUser.state) {
      updatedFields.state = payloadUser.state;
    }

    await User.updateOne({ email: payload.email }, updatedFields);

    const businessId = alreadyExists?.businessGroupId;

    await BusinessGroup.findOneAndUpdate(businessId, payloadGroup, {
      new: true,
    });

    res.send(
      createResponse({}, "Business group has been updated successfully!")
    );
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};

export const deleteBusinessGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      res.send(createHttpError(404, "User is not exists"));
    }
    if (user?.isDeleted) {
      res.send(createHttpError(404, "User is already deleted"));
    }
    await User.updateOne({ _id: id }, { isDeleted: true });
    res.send(createResponse({}, "User has been deleted successfully."));
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};

export const getAllGroups = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // let { page, limit } = req.query;
    // page  = parseInt(page as string) || 1; 
    // limit = parseInt(limit as string) || 10; 
const limit =10;
const startIndex = 0;
    
    // const startIndex = (page - 1) * limit;

    const groups = await User.aggregate([
        {
            $match : {
                isDeleted  : false , 
            }
        },
        {
            $limit : limit
        },
        {
            $skip : startIndex
        }
    ])

    res.send(createResponse({data : groups}, "User has been deleted successfully."));
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};
