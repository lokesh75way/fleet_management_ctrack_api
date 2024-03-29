import { NextFunction, Request, Response } from "express";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";
import Company from "../schema/Company";
import User, { UserRole, UserType } from "../schema/User";

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
      mobileNumber: payload.mobileNumber,
      country: payload.country,
      state: payload.state,
      role: UserRole.COMPANY,
      type: UserType.ADMIN,
    };
    const payloadCompany = { ...payload, createdBy: id };

    delete payloadCompany.email;
    delete payloadCompany.userName;
    delete payloadCompany.password;
    delete payloadCompany.mobileNumber;

    let alreadyExists = await User.findOne({
      email: payload.email,
    });

    if (alreadyExists) {
      res.send(createHttpError(409, "Company with this email already exists"));
    }

    alreadyExists = await User.findOne({
      userName: payload.userName,
    });

    if (alreadyExists) {
      res.send(
        createHttpError(409, "Company with this username already exists")
      );
    }

    alreadyExists = await User.findOne({
      mobileNumber: payload.mobileNumber,
    });

    if (alreadyExists) {
      res.send(
        createHttpError(409, "Company with this phone number already exists")
      );
    }

    const newCompany = await Company.create({
      ...payloadCompany,
    });
    if (!newCompany) {
      res.send(createHttpError(400, "Company is not created"));
    }
    const newUser = await User.create({
      ...payloadUser,
      companyId: newCompany._id,
    });

    if (!newUser) {
      res.send(createHttpError(400, "User is not created"));
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

    let query: any = { isDeleted: false, role: UserRole.COMPANY };
    let secondQuery: any;
    if (role === "BUSINESS_GROUP") {
      secondQuery["createdBy"] = id;
    }

    let { page, limit } = req.query;
    let page1 = parseInt(page as string) || 1;
    let limit1 = parseInt(limit as string) || 10;

    const totalCount = await User.countDocuments({ isDeleted: false });

    const totalPages = Math.ceil(totalCount / limit1);

    const startIndex = (page1 - 1) * limit1;

    const companies = await User.find(query).populate([
      { path: "companyId", match: secondQuery },
      { path: "companyId", populate: { path: "businessGroupId" , select :"groupName" } },
    ]);

    res.send(createResponse({ data: companies, totalPage: totalPages }));
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};

export const updateCompanyUser = async (
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
    const payloadCompany = { ...payload };

    delete payloadCompany.email;
    delete payloadCompany.userName;
    delete payloadCompany.password;
    delete payloadCompany.mobileNumber;

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

    const companyId = alreadyExists?.businessGroupId;

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
    const user = await User.findOne({ _id: id });
    if (!user) {
      res.send(createHttpError(404, "User is not exists"));
      return
    }
    if (user?.isDeleted) {
      res.send(createHttpError(404, "User is already deleted"));
      return
    }
    await User.updateOne({ _id: id }, { isDeleted: true });
    res.send(createResponse({}, "User has been deleted successfully."));
    return
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};
