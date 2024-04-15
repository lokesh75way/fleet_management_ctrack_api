import { NextFunction, Request, Response } from "express";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";
import Company from "../schema/Company";
import User, { UserRole, UserType } from "../schema/User";
import bcrypt from "bcrypt";

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
      businessGroupId: payload.businessGroupId,
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
      throw createHttpError(409, "Company with this email already exists");
    }

    alreadyExists = await User.findOne({
      userName: payload.userName,
    });

    if (alreadyExists) {
      throw createHttpError(409, "Company with this username already exists");
    }

    alreadyExists = await User.findOne({
      mobileNumber: payload.mobileNumber,
    });

    if (alreadyExists) {
      throw createHttpError(
        409,
        "Company with this phone number already exists"
      );
    }

    const newCompany = await Company.create({
      ...payloadCompany,
    });
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

    let query: any = { isDeleted: false, role: UserRole.COMPANY };
    let secondQuery: any = {};
    if (role === "BUSINESS_GROUP") {
      secondQuery["createdBy"] = id;
    }
    console.log(id);

    let { page, limit, businessGroupId } = req.query;
    let page1 = parseInt(page as string) || 1;
    let limit1 = parseInt(limit as string) || 10;

    const totalCount = await User.countDocuments(query);

    const startIndex = (page1 - 1) * limit1;

    let companies: any[] = await User.find(query)
      .populate([
        {
          path: "companyId",
          match: secondQuery,
          populate: {
            path: "businessGroupId",
            select: "groupName",
          },
        },
      ])
      .limit(limit1)
      .skip(startIndex)
      .sort({ _id: -1 });

    const Companies: any[] = await User.aggregate([
      {
        $match: {
          role: "COMPANY",
        },
      },
      {
        $lookup: {
          from: "companies",
          localField: "companyId",
          foreignField: "_id",
          as: "companyId",
        },
      },
      {
        $unwind: {
          path: "$companyId",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $and: [
            { "companyId": { $ne: null } },
            { "companyId.createdBy": id }
          ]
        },
      },
    ]);
    console.log(companies)

    if (businessGroupId) {
      console.log(companies);
      companies = companies.filter((company) => company.businessGroupId);
    }

    companies = companies.filter((item) => item.companyId);

    res.send(createResponse({ data: companies, totalCount }));
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
      businessGroupId: payload.businessGroupId,
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

    let alreadyExist = await User.findOne({
      $or: [{ email: payload.email }],
    });
    if (!alreadyExist) {
      res.send(createHttpError(404, "Company with this email is not exists"));
      return;
    }
    const companyId = alreadyExist?.companyId;

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

    if (payloadUser.mobileNumber) {
      const alreadyExists = await User.findOne({
        _id: { $ne: alreadyExist._id },
        mobileNumber: payload.mobileNumber,
      });
      if (alreadyExists) {
        throw createHttpError(409, "Company with mobileNumber already exists");
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
    const user = await User.findOne({ _id: id });
    if (!user) {
      res.send(createHttpError(404, "Company is not exists"));
      return;
    }
    if (user?.isDeleted) {
      res.send(createHttpError(404, "Company is already deleted"));
      return;
    }
    await User.updateOne({ _id: id }, { isDeleted: true });
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
  const existUser = await User.findOne({ _id: _id }).select("password");
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
