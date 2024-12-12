import { NextFunction, Request, Response } from "express";
import User, { IUser, UserRole } from "../schema/User";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";
import {
  generatePasswordToken,
  generateToken,
  verifyPasswordToken,
} from "../services/passport-jwt";
import bcrypt from "bcrypt";
import { forgetPasswordEmailTemplate, sendEmail } from "../services/email";
import Permission from "../schema/Permission";
import { getTemplate } from "../utils";

/**
 * User login
 * @param { email, password } req.body
 * @param res
 */
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const { user: userData, token } = await generateToken(user);
    const options = { new: true };
    let data: any = await User.aggregate([
      {
        $match: {
          _id: user._id,
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
        $lookup: {
          from: "business-groups",
          localField: "businessGroupId",
          foreignField: "_id",
          as: "businessGroupId",
        },
      },

      {
        $addFields: {
          logo: {
            $arrayElemAt: [
              {
                $cond: {
                  if: { $eq: ["$role", "COMPANY"] },
                  then: "$companyId.logo",
                  else: "$businessGroupId.logo",
                },
              },
              0,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          userName: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          mobileNumber: 1,
          isActive: 1,
          isDeleted: 1,
          role: 1,
          type: 1,
          branchIds: 1,
          vehicleIds: 1,
          createdAt: 1,
          updatedAt: 1,
          featureTemplateId: 1,
          businessGroupId: {
            _id: 1,
            groupName: 1,
          },
          companyId: {
            _id: 1,
            companyName: 1,
          },
          logo: 1,
        },
      },
    ]);

    if (!data) {
      res.send(createResponse({}, "User not found!"));
      return;
    }

    let permissions = [];
    if (data[0].role === UserRole.USER) {
      permissions = await Permission.find({
        _id: data[0].featureTemplateId,
      }).populate("permission.moduleId");
    }

    if (!data[0]?.logo) {
      data["logo"] = "";
    }

    res.send(
      createResponse(
        { user: data[0], token, permissions },
        "Login successfully!"
      )
    );
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message,
      data: { user: null },
    });
  }
};

/**
 * User change password
 * @param { password, newPassword} req.body
 * @param res
 */
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const id = req.user.id;
    const condition = { _id: id };
    const options = { new: true };

    const { password, newPassword } = req.body;

    const user = await User.findOne({ _id: id }).select("password");

    const validate = await user?.isValidPassword(password);
    if (!validate) {
      throw createHttpError(400, {
        message: `Current password did not match! Please try again.`,
        data: { user: null },
      });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    const updatePassword = await User.findOneAndUpdate(
      condition,
      { password: hash },
      options
    );

    res.send(createResponse({}, "Password changes successfully!"));
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};

/**
 * User profile update
 * @param { token, name, password } req.body
 * @param res
 */
export const profileUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const _id = req.user.id;
    const payload = req.body;
    const options = { new: true };

    const user = await User.findByIdAndUpdate(_id, payload, options);

    if (!user) {
      throw createHttpError(400, {
        message: `Failed to update profile!`,
        data: { user: null },
      });
    }

    res.send(createResponse(user, `Profile updated successfully!`));
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message,
      data: { user: null },
    });
  }
};

/**
 * User forget password send link on email
 * @param { email } req
 * @param res
 */
export const forgetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      throw createHttpError(400, {
        message: `Email does not exist! Please try again`,
      });
    }

    const token = await generatePasswordToken(user);

    if (token) {
      const body = await forgetPasswordEmailTemplate(
        token,
        user.userName ? user.userName : user.email
      );
      const send = sendEmail({
        to: user.email,
        subject: "Password reset link",
        html: body,
      });
      res.send(
        createResponse(
          {},
          `A password reset link send to your registered email`
        )
      );
    }
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};

/**
 * User password reset by reset link
 * @param { token, password } req
 * @param res
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.body;
    const verify = verifyPasswordToken(payload.token);

    if (!verify) {
      throw createHttpError(400, {
        message: `Invalid link or expired!`,
        data: { user: null },
      });
    }

    // @ts-ignore
    const condition = { _id: verify.user.id };
    const options = { new: true };
    const hash = await bcrypt.hash(payload.password, 12);

    const updatePassword = await User.findOneAndUpdate(
      condition,
      { password: hash },
      options
    );

    if (!updatePassword) {
      throw createHttpError(400, {
        message: `Failed to set new password!`,
        data: { user: null },
      });
    }

    res.send(createResponse({}, `Password changed successfully!`));
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};

export const adminRegister = async (req: Request, res: Response) => {
  const { name, email, password, mobile, username } = req.body;
  await User.create({
    email,
    password,
    firstName: name,
    userName: username,
    lastName: "",
    mobileNumber: mobile,
    role: "SUPER_ADMIN",
  });
  res.send(createResponse({}, "Admin created successfully"));
};
