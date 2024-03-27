import { NextFunction, Request, Response } from "express";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";
import User, { UserRole, UserType } from "../schema/User";
import Company from "../schema/Company";
import BusinessGroup from "../schema/BusinessGroup";
import Permission from "../schema/Permission";

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const id = req.user._id;
    // @ts-ignore
    const role: UserRole = req.user.role;

    let data : any = await User.findById(id).select("-password ");

    if (role === UserRole.COMPANY) {
      data = await Company.findOne({createdBy : id}).populate("createdBy");
    }
    if(role === UserRole.BUSINESS_GROUP){
        data = await BusinessGroup.findOne({createdBy : id}).populate("createdBy");
    }
   
    res.send(createResponse({data}));
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};
