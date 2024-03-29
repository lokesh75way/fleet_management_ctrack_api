import { NextFunction, Request, Response } from "express";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";
import BusinessGroup from "../schema/BusinessGroup";
import User, { UserRole, UserType } from "../schema/User";
import bcrypt from "bcrypt";

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

  

  let alreadyExists = await User.findOne({
    email: payload.email,
  });

  if (alreadyExists) {
    res.send(createHttpError(409, "Company with this email already exists"));
  }

  alreadyExists = await User.findOne({
    userName: payload.userName,
    //   { mobileNumber: payload.mobileNumber },
  });

  if (alreadyExists) {
    res.send(createHttpError(409, "Company with this username already exists"));
  }

  alreadyExists = await BusinessGroup.findOne({
    groupName: payload.groupName,
  });

  if (alreadyExists) {
    res.send(createHttpError(409, "Group Name with this name already exists"));
  }

  alreadyExists = await User.findOne({
    mobileNumber: payload.mobileNumber,
  });

  if (alreadyExists) {
    res.send(
      createHttpError(
        409,
        "Business group with this phone number already exists"
      )
    );
    return;
  }

  const newBusinessGroup = await BusinessGroup.create(payloadGroup);
  if (!newBusinessGroup) {
    res.send(createHttpError(400, "Business group is not created"));
    return;
  }
  const newUser = await User.create({
    ...payloadUser,
    businessGroupId: newBusinessGroup._id,
  });

  if (!newUser) {
    res.send(createHttpError(400, "Business group is not created"));
    return;
  }

  res.send(createResponse({}, "Business group has been created successfully!"));
  return;
};

export const updateBusinessUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body;
  console.log(payload)
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
console.log(payloadGroup)
  await BusinessGroup.findOneAndUpdate(businessId, payloadGroup, {
    new: true,
  });

  res.send(createResponse({}, "Business group has been updated successfully!"));
};

export const deleteBusinessGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    console.log(id);
    const user = await User.findOne({ _id: id });
    if (!user) {
      res.send(createHttpError(404, "Business group is not exists"));
    }
    if (user?.isDeleted) {
      res.send(createHttpError(404, "Business group is already deleted"));
    }
    await User.updateOne({ _id: id }, { isDeleted: true });
    res.send(createResponse({}, "Business group has been deleted successfully."));
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
    // @ts-ignore
    const id = req.user._id;
    // @ts-ignore
    const role = req.user.role;

    const query: any = { isDeleted: false, role: UserRole.BUSINESS_GROUP };

    let { page, limit } = req.query;
    let page1 = parseInt(page as string) || 1;
    let limit1 = parseInt(limit as string) || 10;

    const totalCount = await User.countDocuments({ isDeleted: false });

    const totalPages = Math.ceil(totalCount / limit1);

    const startIndex = (page1 - 1) * limit1;

    const groups = await User.find(query)
      .populate({
        path: "businessGroupId",
        match: {
          createdBy: id,
        },
        
      })
      .sort({ _id: -1 }) 
      .limit(limit1)
      .skip(startIndex);

    res.send(createResponse({ data: groups, totalPage: totalPages }));
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  const { password, oldPassword, _id } = req.body;

  const existUser = await User.findOne({ _id: _id }).select(
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
