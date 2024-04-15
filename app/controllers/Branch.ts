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


    const newBranch = await CompanyBranch.create({
      ...payloadBranch,
      createdBy : id
    });

    if (!newBranch) {
      res.send(createHttpError(400, "Branch is not created"));
    }

    const newUser = await User.updateOne(
      {
        businessGroupId: payload.businessGroupId,
      },
      { $push: { branchIds: newBranch._id } }
    );

    const newUser2 = await User.updateOne(
      {
        companyId: payload.companyId,
      },
      { $push: { branchIds: newBranch._id } }
    );

    if (!newUser && !newUser2) {
      res.send(createHttpError(400, "User is not updated"));
    }

    res.send(
      createResponse(newBranch, "Branch has been created successfully!")
    );
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};

export const updateBranch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.body;

    // @ts-ignore
    const branchId = payload.branchId;

    const payloadBranch = { ...payload };

    delete payloadBranch.branchId;

    let alreadyExists = await CompanyBranch.findById(branchId);

    if (!alreadyExists) {
      res.send(createHttpError(404, "Branch is not exists"));
      return;
    }
    await CompanyBranch.findOneAndUpdate({ _id: branchId }, payloadBranch);

    res.send(createResponse({}, "Branch has been updated successfully!"));
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};

export const deleteBranch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const branch = await CompanyBranch.findById(id);
    if (!branch) {
      res.send(createHttpError(404, "Branch is not exists"));
    }
    if (branch?.isDeleted) {
      res.send(createHttpError(404, "Branch is already deleted"));
    }
    await CompanyBranch.updateOne({ _id: id }, { isDeleted: true });
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
    const { companyId, branchId } = req.query;
    let query : any= {
         isDeleted: false ,
    };
    let { page, limit } = req.query;
    let page1 = parseInt(page as string) || 1;
    let limit1 = parseInt(limit as string) || 10;

    const startIndex = (page1 - 1) * limit1;

    const user_id = await User.findById(id).select("companyId businessGroupId");

    if(role === UserRole.SUPER_ADMIN){
      query['createdBy'] = id;
    }

    if (role === UserRole.COMPANY) {
      query["$or"] = 
       [{ companyId  :user_id?.companyId}, {createdBy : id}]
      
    }

    if (role === UserRole.BUSINESS_GROUP) {
      query["$or"] = 
      [{ businessGroupId  :user_id?.businessGroupId}, {createdBy : id}]
    }

    if (companyId) {
      query.companyId = companyId;
    }
    

    if (branchId) {
        query.$or = [{ parentBranchId: branchId }, { _id: branchId }];
    }
    
    let data = await CompanyBranch.find(query)
      .populate([
        { path: "businessGroupId", select: "groupName" },
        { path: "companyId", select: "companyName" },
        { path: "parentBranchId", select: "branchName" },
      ])
      .sort({ createdAt: -1 })
      .limit(limit1)
      .skip(startIndex);

    const totalCount = await CompanyBranch.countDocuments(query);

    if (companyId) {
      data = data.filter((company) => company.companyId);
    }

    res.send(createResponse({ data, totalCount }));
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};
