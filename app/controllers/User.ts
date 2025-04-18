import { NextFunction, Request, Response } from "express";
import User, { UserRole, IUser, UserType } from "../schema/User";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";
import { sendEmail, subadminInvitationEmailTemplate } from "../services/email";
import { generatePasswordToken } from "../services/passport-jwt";
import Permission from "../schema/Permission";
import mongoose from "mongoose";

export const addSubAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.body;
    payload.email = payload.email.trim().toLocaleLowerCase();
    const checkIfExist = await User.findOne({ email: payload.email });
    if (checkIfExist) {
      throw createHttpError(400, {
        message: `Subadmin already exist with this email!`,
      });
    }
    const createSubadmin = await new User({
      ...payload,
      role: UserRole.USER,
      type: UserType.STAFF,
    }).save();

    const token = await generatePasswordToken(createSubadmin);
    const html = subadminInvitationEmailTemplate(token, payload.email);
    const send = sendEmail({
      to: payload.email,
      subject: "Registration For App",
      html: html,
    });

    res.send(createResponse(createSubadmin, "Subadmin created successfully!"));
  } catch (error) {
    console.log(error);
    throw createHttpError(400, {
      message: error ?? "An error occurred.",
      data: { user: null },
    });
  }
};

export const updateSubAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.body;
    const condition = { _id: req.params.id };
    const options = { new: true };

    const updateData = await User.findOneAndUpdate(
      condition,
      payload,
      options
    ).select("-password");

    if (!updateData) {
      throw createHttpError(400, {
        message: `Failed to update subadmin!`,
        data: { user: null },
      });
    }
    res.send(createResponse(updateData, `Subadmin updated successfully!`));
  } catch (error) {
    throw createHttpError(400, {
      message: error,
      data: { user: null },
    });
  }
};

export const deleteSubAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const condition = { _id: req.params.id };

    const updateData = await User.findOneAndUpdate(condition, {
      isDeleted: true,
    }).select("-password");
    if (!updateData) {
      throw createHttpError(400, {
        message: `Failed to update subadmin!`,
        data: { user: null },
      });
    }

    res.send(createResponse({}, `Subadmin updated successfully!`));
  } catch (error) {
    throw createHttpError(400, {
      message: error ?? "An error occurred.",
      data: { user: null },
    });
  }
};

export const getAllSubadmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const id = req.user._id;
    // @ts-ignore
    const role = req?.user.role;

    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "10");
    const { branchId, companyId, groupId } = req.query;

    const startIndex = (page - 1) * limit;

    const user_id = await User.findById(id).select("companyId businessGroupId");

    const condition: any = {
      isDeleted: false,
      role: { $in: [UserRole.USER] },
      type: { $in: [UserType.STAFF, UserType.ADMIN] },
    };

    if (role === UserRole.BUSINESS_GROUP) {
      condition.businessGroupId = user_id?.businessGroupId;
      if (companyId) condition.companyId = companyId;
      if (branchId)
        condition.branchIds = { $in: (branchId as string).split(",") };
    }
    if (role === UserRole.COMPANY) {
      condition.companyId = user_id?.companyId;
      if (branchId)
        condition.branchIds = { $in: (branchId as string).split(",") };
    }

    if (role === UserRole.USER) {
      condition.companyId = user_id?.companyId;
      condition.businessGroupId = user_id?.businessGroupId;
      if (branchId)
        condition.branchIds = { $in: (branchId as string).split(",") };
      else if (user_id?.branchIds && user_id?.branchIds?.length > 0) {
        condition.branchIds = { $in: user_id?.branchIds };
      }
    }

    if (role === UserRole.SUPER_ADMIN) {
      if (companyId) condition.companyId = companyId;
      if (branchId)
        condition.branchIds = { $in: (branchId as string).split(",") };
      if (groupId) condition.businessGroupId = groupId;
    }

    const data = await User.find(condition)
      .select("-password")
      .sort({
        createdAt: -1,
      })
      .skip(startIndex)
      .limit(limit);
    const count = await User.count(condition);

    res.send(createResponse({ data, count }, `Subadmin found successfully!`));
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};

export const getSubAdminById = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user._id;
    // @ts-ignore
    const role = req?.user.role;
    const { id } = req.params;
    let adminId;

    try {
      adminId = new mongoose.Types.ObjectId(id);
    } catch (error) {
      throw createHttpError(403, { message: "Invalid user id" });
    }

    const user_id = await User.findById(userId).select(
      "companyId businessGroupId"
    );

    const condition: any = {
      isDeleted: false,
      _id: adminId,
      role: { $in: [UserRole.USER] },
      type: { $in: [UserType.STAFF, UserType.ADMIN] },
    };

    if (role === UserRole.BUSINESS_GROUP) {
      condition.businessGroupId = user_id?.businessGroupId;
    }
    if (role === UserRole.COMPANY) {
      condition.companyId = user_id?.companyId;
    }

    const data = await User.find(condition).select("-password");

    if (data.length) {
      res.send(createResponse(data[0]));
    } else {
      throw createHttpError(404, { message: "User account not found" });
    }
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};
