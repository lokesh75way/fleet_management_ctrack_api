import { NextFunction, Request, Response } from "express";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";
import BusinessGroup, { IBusinessGroup } from "../schema/BusinessGroup";
import User, { UserRole, UserType } from "../schema/User";
import CompanyBranch from "../schema/CompanyBranch";

export const createCompanyBranch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.body;

    // @ts-ignore
    const id = req.user._id;

    const payloadBranch = { ...payload };

    const alreadyExists = await User.findById(id);

    if (!alreadyExists) {
      res.send(createHttpError(404, "Company doesn't not exist"));
    }

    const newBranch = await CompanyBranch.create({
      ...payloadBranch,
    });

    if (!newBranch) {
      res.send(createHttpError(400, "Branch is not created"));
    }

    const newUser = await User.updateOne(
      {
        _id: id,
      },
      { $push: { branchIds: newBranch._id } }
    );

    if (!newUser) {
      res.send(createHttpError(400, "User is not updated"));
    }

    res.send(createResponse({}, "Branch has been created successfully!"));
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
      isActive: payload.isActive,
      role: UserRole.BUSINESS_GROUP,
      type: UserType.ADMIN,
    };
    const payloadBranch = { ...payload };

    delete payloadBranch.email;
    delete payloadBranch.userName;
    delete payloadBranch.password;
    delete payloadBranch.mobileNumber;

    let alreadyExists = await User.findOne({
      $or: [{ email: payload.email }],
    });
    if (!alreadyExists) {
      res.send(createHttpError(404, "Branch with this email is not exists"));
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

    if (payloadUser.isActive) {
      updatedFields.isActive = payloadUser.isActive;
    }

    await User.updateOne({ email: payload.email }, updatedFields);

    const businessId = alreadyExists?.businessGroupId;

    await BusinessGroup.findOneAndUpdate(businessId, payloadBranch, {
      new: true,
    });

    res.send(createResponse({}, "Branch has been updated successfully!"));
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
    const user = await User.findOne({ businessGroupId: id });
    if (!user) {
      res.send(createHttpError(404, "User is not exists"));
    }
    if (user?.isDeleted) {
      res.send(createHttpError(404, "User is already deleted"));
    }
    await User.updateOne({ businessGroupId: id }, { isDeleted: true });
    res.send(createResponse({}, "User has been deleted successfully."));
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};

export const getAllBranch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    // @ts-ignore
    const id = req.user._id;
    // @ts-ignore
    const role = req.user.role;
console.log(id)
    let query: any = { "createdBy.isDeleted": false };
   let localField = 'businessGroupId';
    if (role === "BUSINESS_GROUP") {
      query["parentCompany.createdBy"] = id;
    }

    if(role === "COMPANY"){
        query["parentCompany.createdBy"] = id;
        localField = "companyId"
    }

    console.log(query)

    let { page, limit } = req.query;
    let page1 = parseInt(page as string) || 1;
    let limit1 = parseInt(limit as string) || 10;

    const totalCount = await User.countDocuments({ isDeleted: false });

    const totalPages = Math.ceil(totalCount / limit1);

    const startIndex = (page1 - 1) * limit1;

    const groups = await CompanyBranch.aggregate([
      {
        $lookup: {
          from: "companies",
          localField: "companyId" ,
          foreignField: "_id",
          as: "parentCompany",
        },
      },
      {
        $unwind: "$parentCompany" 
      },
    //   {
    //     $match : {
    //         "parentCompany.userInfo._id" : id
    //     }
    //   },
      {
        $lookup : {
            from : "users",
            localField : "parentCompany.createdBy",
            foreignField :"_id",
            as : "userInfo",
        }
      },
      
    //   {
    //     $match: query
    //   },
      {
        $limit: limit1,
      },
      {
        $skip: startIndex,
      },
    ]);

    res.send(createResponse({ data: groups, totalPage: totalPages }));
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};
