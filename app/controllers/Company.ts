import { NextFunction, Request, Response } from "express";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";
import Company from "../schema/Company";
import User, { UserRole, UserType } from "../schema/User";
import bcrypt from "bcrypt";
import CompanyBranch from "../schema/CompanyBranch";
import mongoose, { Types } from "mongoose";

export const createCompany = async (
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
      businessGroupId: payload.businessGroupId,
      country: payload.country,
      state: payload.state,
      city : payload.city,
      userInfo : payload.userInfo,
      role: UserRole.COMPANY,
      type: UserType.ADMIN,
    };
    const payloadCompany = { ...payload, createdBy: id };

    delete payloadCompany.email;
    delete payloadCompany.userName;
    delete payloadCompany.password;
    delete payloadCompany.mobileNumber;
    delete payloadCompany.userInfo

    let alreadyExists = await User.findOne({
      email: payload.userInfo.email,
    });

    if (alreadyExists) {
      throw createHttpError(409, "Company with this email already exists");
    }

    alreadyExists = await User.findOne({
      userName: payload.userName,
    });

    if (alreadyExists) {
      throw createHttpError(409, "Company with this username already exists");
    }
    const newCompany = await Company.create(payloadCompany);
    if (!newCompany) {
      throw createHttpError(400, "Company is not created");
    }

    const newUser = await User.create({
      ...payloadUser,
      companyId: newCompany._id,
    });

    if (!newUser) {
      throw createHttpError(400, "User is not created");
    }

    res.send(createResponse({}, "Company has been created successfully!"));
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};

export const getAllCompanies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const id = req.user._id;
    // @ts-ignore
    const role = req.user.role;

    let { page, limit, businessGroupId } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const startIndex = (pageNumber - 1) * limitNumber;

    // Base match condition
    let matchCondition: any = { isDeleted: false, role: UserRole.COMPANY };

    // Additional filtering for BUSINESS_GROUP role
    if (role === "BUSINESS_GROUP") {
      // Fetch the user and only get the businessGroupId field
      const businessGroupUser =
        await User.findById(id).select("businessGroupId");

      // Ensure we are accessing the `businessGroupId` as an ObjectId (not as an embedded document)
      const businessGroupId = businessGroupUser?.businessGroupId;

      if (businessGroupId) {
        matchCondition["$or"] = [
          { businessGroupId: businessGroupId },
          { "companyId.createdBy._id": new mongoose.Types.ObjectId(id) },
        ];
      }
    }

    // Apply businessGroupId filter
    if (businessGroupId) {
      const businessGroupIdStr = Array.isArray(businessGroupId)
        ? businessGroupId[0]
        : businessGroupId; // Handle array cases

      // Ensure that businessGroupId is a valid string
      if (
        typeof businessGroupIdStr === "string" &&
        Types.ObjectId.isValid(businessGroupIdStr)
      ) {
        matchCondition["$or"] = [
          { businessGroupId: new Types.ObjectId(businessGroupIdStr) },
          {
            "companyId.createdBy.businessGroupId": new Types.ObjectId(
              businessGroupIdStr
            ),
          },
        ];
      }
    }

    // Aggregation pipeline
    const companiesPipeline: any[] = [
      { $match: matchCondition },
      {
        $lookup: {
          from: "companies",
          localField: "companyId",
          foreignField: "_id",
          as: "companyDetails",
        },
      },
      {
        $unwind: { path: "$companyDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "business-groups",
          localField: "companyDetails.businessGroupId",
          foreignField: "_id",
          as: "businessGroupDetails",
        },
      },
      {
        $unwind: {
          path: "$businessGroupDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "companyDetails.createdBy",
          foreignField: "_id",
          as: "companyDetails.createdBy",
        },
      },
      {
        $unwind: {
          path: "$companyDetails.createdBy",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "company-branches",
          let: { companyId: "$companyDetails._id" },
          pipeline: [
            { 
              $match: { 
                $expr: { $eq: ["$companyId", "$$companyId"] },
                isDeleted: false 
              } 
            },
            { $project: { _id: 1 } } // Only get IDs
          ],
          as: "branchIds"
        }
      },
      {
        $addFields: {
          companyId: {
            _id: "$companyDetails._id",
            businessGroupId: {
              _id: "$businessGroupDetails._id",
              groupName: "$businessGroupDetails.groupName",
            },
            companyName: "$companyDetails.companyName",
            tradeLicenseNumber: "$companyDetails.tradeLicenseNumber",
            officeNumber: "$companyDetails.officeNumber",
            workStartDay: "$companyDetails.workStartDay",
            dateFormat: "$companyDetails.dateFormat",
            timeFormat: "$companyDetails.timeFormat",
            timezone: "$companyDetails.timezone",
            createdBy: {
              _id: "$companyDetails.createdBy._id",
              userName: "$companyDetails.createdBy.userName",
              userInfo: "$companyDetails.createdBy.userInfo",
              email: "$companyDetails.createdBy.email",
              country: "$companyDetails.createdBy.country",
              state: "$companyDetails.createdBy.state",
              city: "$companyDetails.createdBy.city",
              isActive: "$companyDetails.createdBy.isActive",
              isDeleted: "$companyDetails.createdBy.isDeleted",
              role: "$companyDetails.createdBy.role",
              type: "$companyDetails.createdBy.type",
              businessGroupId: "$companyDetails.createdBy.businessGroupId",
              branchIds: "$branchIds._id",
              vehicleIds: "$companyDetails.createdBy.vehicleIds",
              createdAt: "$companyDetails.createdBy.createdAt",
              updatedAt: "$companyDetails.createdBy.updatedAt",
            },
            createdAt: "$companyDetails.createdAt",
            updatedAt: "$companyDetails.updatedAt",
          },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $facet: {
          metadata: [{ $count: "totalCount" }],
          data: [{ $skip: startIndex }, { $limit: limitNumber }],
        },
      },
    ];

    // Execute aggregation
    const result = await User.aggregate(companiesPipeline);

    // Extract data and metadata
    const companies = result[0]?.data || [];
    const totalCount = result[0]?.metadata[0]?.totalCount || 0;

    // Send response
    res.send(createResponse({ data: companies, totalCount }));
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};

export const getCompanyById = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user._id;
  // @ts-ignore
  const role = req.user.role;
  const { id } = req.params;
  let cId;

  try {
    cId = new mongoose.Types.ObjectId(id);
  } catch (error) {
    throw createHttpError(403, { message: "Invalid company id" });
  }

  // Base match condition
  let matchCondition: any = {
    isDeleted: false,
    role: UserRole.COMPANY,
    companyId: cId,
  };

  // Additional filtering for BUSINESS_GROUP role
  if (role === "BUSINESS_GROUP") {
    // Fetch the user and only get the businessGroupId field
    const businessGroupUser =
      await User.findById(userId).select("businessGroupId");

    // Ensure we are accessing the `businessGroupId` as an ObjectId (not as an embedded document)
    const businessGroupId = businessGroupUser?.businessGroupId;

    if (businessGroupId) {
      matchCondition["$or"] = [
        { businessGroupId: businessGroupId },
        { "companyId.createdBy._id": new mongoose.Types.ObjectId(userId) },
      ];
    }
  }

  // Aggregation pipeline
  const companiesPipeline = [
    { $match: matchCondition },
    {
      $lookup: {
        from: "companies",
        localField: "companyId",
        foreignField: "_id",
        as: "companyDetails",
      },
    },
    { $unwind: { path: "$companyDetails", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "business-groups",
        localField: "companyDetails.businessGroupId",
        foreignField: "_id",
        as: "businessGroupDetails",
      },
    },
    {
      $unwind: {
        path: "$businessGroupDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "companyDetails.createdBy",
        foreignField: "_id",
        as: "companyDetails.createdBy",
      },
    },
    {
      $unwind: {
        path: "$companyDetails.createdBy",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        companyId: {
          _id: "$companyDetails._id",
          businessGroupId: {
            _id: "$businessGroupDetails._id",
            groupName: "$businessGroupDetails.groupName",
          },
          companyName: "$companyDetails.companyName",
          tradeLicenseNumber: "$companyDetails.tradeLicenseNumber",
          officeNumber: "$companyDetails.officeNumber",
          workStartDay: "$companyDetails.workStartDay",
          dateFormat: "$companyDetails.dateFormat",
          timeFormat: "$companyDetails.timeFormat",
          timezone: "$companyDetails.timezone",
          createdBy: {
            _id: "$companyDetails.createdBy._id",
            userName: "$companyDetails.createdBy.userName",
            userInfo: "$companyDetails.createdBy.userInfo",
            email: "$companyDetails.createdBy.email",
            country: "$companyDetails.createdBy.country",
            state: "$companyDetails.createdBy.state",
            city: "$companyDetails.createdBy.city",
            isActive: "$companyDetails.createdBy.isActive",
            isDeleted: "$companyDetails.createdBy.isDeleted",
            role: "$companyDetails.createdBy.role",
            type: "$companyDetails.createdBy.type",
            businessGroupId: "$companyDetails.createdBy.businessGroupId",
            branchIds: "$companyDetails.createdBy.branchIds",
            vehicleIds: "$companyDetails.createdBy.vehicleIds",
            createdAt: "$companyDetails.createdBy.createdAt",
            updatedAt: "$companyDetails.createdBy.updatedAt",
          },
          createdAt: "$companyDetails.createdAt",
          updatedAt: "$companyDetails.updatedAt",
        },
      },
    },
  ];

  // Execute aggregation
  const result = await User.aggregate(companiesPipeline);

  if (result.length) {
    res.send(createResponse(result[0]));
  } else {
    throw createHttpError(404, { message: "Company not found" });
  }
};

export const updateCompanyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.body;
    const { id } = req.params;
    // @ts-ignore
    const userId = req.user._id;

    const payloadUser = {
      userName: payload.userName,
      email: payload.email,
      password: payload.password,
      mobileNumber: payload.mobileNumber,
      businessGroupId: payload.businessGroupId,
      country: payload.country,
      state: payload.state,
      city: payload.city,
      userInfo: payload.userInfo,
      role: UserRole.BUSINESS_GROUP,
      type: UserType.ADMIN,
    };
    const payloadCompany = { ...payload };

    delete payloadCompany.email;
    delete payloadCompany.userName;
    delete payloadCompany.password;
    delete payloadCompany.mobileNumber;
    delete payloadCompany.userInfo;
    delete payloadCompany.country;
    delete payloadCompany.city;
    delete payloadCompany.state;

    let alreadyExist = await User.findOne({
      $or: [{ companyId: new mongoose.Types.ObjectId(id) }],
    });
    if (!alreadyExist) {
      res.send(createHttpError(404, "Company with this email is not exists"));
      return;
    }
    const companyId = alreadyExist?.companyId;

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
        throw createHttpError(409, "Company with username already exists");
      }
    }

    if (payloadUser.email) {
      const alreadyExists = await User.findOne({
        _id: { $ne: alreadyExist._id },
        email: payload.email,
      });
      if (alreadyExists) {
        throw createHttpError(409, "Company with email already exists");
      }
    }

    if (payloadCompany.companyName) {
      const alreadyExists = await Company.findOne({
        _id: { $ne: companyId },
        companyName: payload.companyName,
      });
      if (alreadyExists) {
        throw createHttpError(409, "Company with this name already exists");
      }
    }

    await User.updateOne({ email: payload.email }, updatedFields);

    await Company.findOneAndUpdate(companyId, payloadCompany, {
      new: true,
    });

    res.send(createResponse({}, "Company has been updated successfully!"));
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};

export const deleteCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const company = await Company.findOne({ _id: id, isDeleted: false });
    if (!company) {
      throw createHttpError(400, "Company not found.");
    }

    // Update related records with isDeleted: true
    await Company.findByIdAndUpdate(id, { isDeleted: true });
    await CompanyBranch.updateMany({ companyId: id }, { isDeleted: true });
    await User.updateMany({ companyId: id }, { isDeleted: true });

    res.send(createResponse({}, "Company has been deleted successfully."));
    return;
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  const { password, oldPassword, _id } = req.body;
  const existUser = await User.findOne({ companyId: _id }).select("password");
  if (existUser) {
    const matched = await existUser.isValidPassword(oldPassword);
    if (!matched) {
      throw createHttpError(400, { message: "Old password is not correct" });
    }
    const hash = await bcrypt.hash(password, 12);
    await User.findOneAndUpdate({ _id: existUser?._id }, { password: hash });
  } else {
    throw createHttpError(400, { message: "Company not found" });
  }

  res.send(createResponse({ _id }, "Password changed successfully"));
};
