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
    res.send(
      createResponse({success : false , message :"Business group with this email already exists" },"Business group with this email already exists" )
    );
    return;
  }

  alreadyExists = await User.findOne({
    userName: payload.userName,
    //   { mobileNumber: payload.mobileNumber },
  });

  if (alreadyExists) {
    res.send(
      createResponse({success : false , message : "Business group with this username already exists"}, "Business group with this username already exists")
    );
    return;
  }

  alreadyExists = await BusinessGroup.findOne({
    groupName: payload.groupName,
  });

  if (alreadyExists) {
    res.send(createResponse({success : false , message :  "Group Name with this name already exists"}, "Group Name with this name already exists"));
    return;
  }

  alreadyExists = await User.findOne({
    mobileNumber: payload.mobileNumber,
  });

  if (alreadyExists) {
    res.send(
      createResponse({success : false , message :"Business group with this phone number already exists" }, "Business group with this phone number already exists")
    );
    return;
  }

  const newBusinessGroup = await BusinessGroup.create(payloadGroup);
  if (!newBusinessGroup) {
    res.send(createResponse({success : false , message : "Business group is not created"}, "Business group is not created"));
    return;
  }
  const newUser = await User.create({
    ...payloadUser,
    businessGroupId: newBusinessGroup._id,
  });

  if (!newUser) {
    res.send(createResponse({success : false , message : "Business group is not created"}, "Business group is not created"));
    return;
  }

  res.send(createResponse({success : true ,message : "Business group has been created successfully!"}, "Business group has been created successfully!"));
  return;
};

export const updateBusinessUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body;
  console.log(payload);
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
    res.send(createResponse({success : false , message : "Business group with this email is not exists"}, "Business group with this email is not exists"));
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
  console.log(payloadGroup);
  await BusinessGroup.findOneAndUpdate(businessId, payloadGroup, {
    new: true,
  });

  res.send(createResponse({success : true , message : "Business group has been updated successfully!"}, "Business group has been updated successfully!"));
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
      return;
    }
    if (user?.isDeleted) {
      res.send(createHttpError(404, "Business group is already deleted"));
      return;
    }
    await User.updateOne({ _id: id }, { isDeleted: true });
    res.send(
      createResponse({}, "Business group has been deleted successfully.")
    );
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

    const totalCount = await User.countDocuments(query);

    const totalPages = Math.ceil(totalCount / limit1);

    const startIndex = (page1 - 1) * limit1;

    const groups = await User.find(query)
      .populate({
        path: "businessGroupId",
        // match: {
        //   createdBy: id,
        // },
      })
      .sort({ _id: -1 })
      .limit(limit1)
      .skip(startIndex);

    res.send(createResponse({ data: groups,totalCount , totalPage: totalPages }));
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
    throw createHttpError(400, { message: "Business group not found" });
  }

  res.send(createResponse({ _id }, "Password changed successfully"));
};
