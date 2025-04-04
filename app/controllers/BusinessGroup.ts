import { NextFunction, Request, Response } from "express";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";
import BusinessGroup from "../schema/BusinessGroup";
import User, { UserRole, UserType } from "../schema/User";
import bcrypt from "bcrypt";
import Company from "../schema/Company";
import CompanyBranch from "../schema/CompanyBranch";
import mongoose from "mongoose";

export const createBusinessUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body;

  // @ts-ignore
  const id = req.user._id;
  const payloadUser = {
    userName: payload.userName,
    email: payload.email,
    password: payload.password,
    country: payload.country,
    state: payload.state,
    city: payload.city,
    userInfo: payload.userInfo,
    role: UserRole.BUSINESS_GROUP,
    type: UserType.ADMIN,
  };
  const payloadGroup = { ...payload, createdBy: id };

  delete payloadGroup.email;
  delete payloadGroup.userName;
  delete payloadGroup.password;
  delete payloadGroup.mobileNumber;
  delete payloadGroup.city;
  delete payloadGroup.country;

  delete payloadGroup.state;
  delete payloadGroup.userInfo;

  let alreadyExists = await User.findOne({
    email: payload.email,
  });

  if (alreadyExists) {
    throw createHttpError(409, "Business group with this email already exists");
  }

  alreadyExists = await User.findOne({
    userName: payload.userName,
  });

  if (alreadyExists) {
    throw createHttpError(
      409,
      "Business group with this username already exists"
    );
  }

  alreadyExists = await BusinessGroup.findOne({
    groupName: payload.groupName,
  });

  if (alreadyExists) {
    throw createHttpError(409, "Group Name with this name already exists");
  }

  const newBusinessGroup = await BusinessGroup.create(payloadGroup);
  await User.create({
    ...payloadUser,
    businessGroupId: newBusinessGroup._id,
  });

  res.send(createResponse({}, "Business group has been created successfully!"));
  return;
};

export const updateBusinessUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  // @ts-ignore
  const userId = req.user._id;
  const payload = req.body;
  const payloadUser = {
    userName: payload.userName,
    password: payload.password,
    country: payload.country,
    email: payload.email,
    state: payload.state,
    city: payload.city,
    userInfo: payload.userInfo,
    role: UserRole.BUSINESS_GROUP,
    type: UserType.ADMIN,
  };
  console.log(payload);
  const payloadGroup = { ...payload };

  delete payloadGroup.email;
  delete payloadGroup.userName;
  delete payloadGroup.password;
  delete payloadGroup.mobileNumber;
  delete payloadGroup.city;
  delete payloadGroup.country;

  delete payloadGroup.state;
  delete payloadGroup.userInfo;
  let alreadyExist = await User.findOne({
    $or: [{ businessGroupId: new mongoose.Types.ObjectId(id) }],
  });

  if (!alreadyExist) {
    throw createHttpError(409, "Business group with this email is not exists");
  }

  const businessId = alreadyExist?.businessGroupId;

  const updatedFields: any = {};

  if (payloadUser.userInfo) {
    updatedFields.userInfo = payloadUser.userInfo;
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
  if (payloadUser.city) {
    updatedFields.city = payloadUser.city;
  }

  if (payloadUser.userName) {
    const alreadyExists = await User.findOne({
      _id: { $ne: alreadyExist._id },
      userName: payload.userName,
    });
    if (alreadyExists) {
      throw createHttpError(409, "Business Group with username already exists");
    }
  }

  if (payloadUser.email) {
    const alreadyExists = await User.findOne({
      _id: { $ne: alreadyExist._id },
      email: payload.email,
    });
    if (alreadyExists) {
      throw createHttpError(409, "Business Group with email already exists");
    }
  }

  if (payloadGroup.groupName) {
    const alreadyExists = await BusinessGroup.findOne({
      _id: { $ne: businessId },
      groupName: payload.groupName,
    });
    if (alreadyExists) {
      throw createHttpError(
        409,
        "Business Group with group name already exists"
      );
    }
  }

  await User.updateOne({ email: payload.email }, updatedFields);

  await BusinessGroup.findOneAndUpdate(businessId, payloadGroup, {
    new: true,
  });

  res.send(
    createResponse(
      {
        success: true,
        message: "Business group has been updated successfully!",
      },
      "Business group has been updated successfully!"
    )
  );
};

export const deleteBusinessGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Check if the business group exists
    const businessGroup = await BusinessGroup.findOne({
      _id: id,
      isDeleted: false,
    });
    if (!businessGroup) {
      throw createHttpError(400, "Business group not found.");
    }

    // Update related records with isDeleted: true
    await BusinessGroup.findByIdAndUpdate(id, { isDeleted: true });
    await Company.updateMany({ businessGroupId: id }, { isDeleted: true });
    await CompanyBranch.updateMany(
      { businessGroupId: id },
      { isDeleted: true }
    );
    await User.updateMany({ businessGroupId: id }, { isDeleted: true });

    res.send(
      createResponse(
        {},
        "Business group and related data have been marked as deleted."
      )
    );
    return;
  } catch (error: any) {
    next(
      createHttpError(400, {
        message: error?.message ?? "An error occurred.",
        data: { user: null },
      })
    );
  }
};

export const getAllGroups = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const id = req.user._id;
    // @ts-ignore
    const role = req.user.role;

    const query: any = { isDeleted: false, role: UserRole.BUSINESS_GROUP };

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (role !== "SUPER_ADMIN") {
      const user = await User.findById(id);
      query.businessGroupId = user?.businessGroupId;
    }

    const totalCount = await User.countDocuments(query);

    const totalPages = Math.ceil(totalCount / limit);

    const startIndex = (page - 1) * limit;

    const groups = await User.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: "business-groups",
          localField: "businessGroupId",
          foreignField: "_id",
          as: "businessGroup",
        },
      },
      {
        $unwind: {
          path: "$businessGroup",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          businessGroupId: "$businessGroup",
        },
      },
      {
        $unset: "businessGroup",
      },
      {
        $lookup: {
          from: "companies",
          let: { businessGroupId: "$businessGroupId._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$businessGroupId", "$$businessGroupId"] },
                    { $eq: ["$isDeleted", false] },
                  ],
                },
              },
            },
          ],
          as: "companyCount",
        },
      },
      {
        $addFields: {
          companyCount: { $size: "$companyCount" },
        },
      },
      // {
      //   $match: {
      //     $expr: {
      //       $cond: {
      //         if: { $eq: [role, "SUPER_ADMIN"] },
      //         then: {},
      //         else: { $eq: ["$businessGroupId.createdBy", id] },
      //       },
      //     },
      //   },
      // },
      {
        $project: {
          password: 0,
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $skip: startIndex,
      },
      {
        $limit: 10,
      },
    ]);

    res.send(
      createResponse({ data: groups, totalCount, totalPage: totalPages })
    );
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};

export const getGroupById = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user._id;
  // @ts-ignore
  const role = req.user.role;
  const { id } = req.params;
  let bId;

  try {
    bId = new mongoose.Types.ObjectId(id);
  } catch (error) {
    throw createHttpError(403, { message: "Invalid business id" });
  }

  const query: any = {
    isDeleted: false,
    role: UserRole.BUSINESS_GROUP,
    businessGroupId: bId,
  };
  const groups = await User.aggregate([
    {
      $match: query,
    },
    {
      $lookup: {
        from: "business-groups",
        localField: "businessGroupId",
        foreignField: "_id",
        as: "businessGroup",
      },
    },
    {
      $unwind: {
        path: "$businessGroup",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        businessGroupId: "$businessGroup",
      },
    },
    {
      $unset: "businessGroup",
    },
    {
      $lookup: {
        from: "companies",
        let: { businessGroupId: "$businessGroupId._id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$businessGroupId", "$$businessGroupId"] },
                  { $eq: ["$isDeleted", false] },
                ],
              },
            },
          },
        ],
        as: "companyCount",
      },
    },
    {
      $addFields: {
        companyCount: { $size: "$companyCount" },
      },
    },
    {
      $match: {
        $expr: {
          $cond: {
            if: { $eq: [role, "SUPER_ADMIN"] },
            then: {},
            else: { $eq: ["$businessGroupId.createdBy", id] },
          },
        },
      },
    },
    {
      $project: {
        password: 0,
      },
    },
  ]);

  if (groups.length) {
    res.send(createResponse(groups[0]));
  } else {
    throw createHttpError(404, { message: "Business group not found" });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  const { password, oldPassword, _id } = req.body;

  const existUser = await User.findOne({ businessGroupId: _id }).select(
    "password"
  );

  if (existUser) {
    const matched = await existUser.isValidPassword(oldPassword);
    if (!matched) {
      throw createHttpError(400, { message: "Old password is not correct" });
    }
    const hash = await bcrypt.hash(password, 12);
    await User.findOneAndUpdate({ _id: existUser?._id }, { password: hash });
  } else {
    throw createHttpError(400, { message: "Business group not found" });
  }

  res.send(createResponse({ _id }, "Password changed successfully"));
};
