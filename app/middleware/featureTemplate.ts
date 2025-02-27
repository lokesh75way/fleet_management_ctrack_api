import { NextFunction, Request, Response } from "express";
import User, { UserRole } from "../schema/User";
import Permission from "../schema/Permission";
import createHttpError from "http-errors";

export const permissionAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req.user._id;
  // @ts-ignore
  const role = req.user.role;
  const method = req.method;
  const basePath = req.originalUrl;

  const moduleId = req.headers["moduleid"];

  if (role === UserRole.USER) {
    const featureTemplateId: any =
      await User.findById(userId).select("featureTemplateId");

    const permission = await Permission.findOne({
      _id: featureTemplateId.featureTemplateId,
    });

    const extractpermissions = [...permission.permission];
    const askedPermission = extractpermissions.filter(
      (data) => data.moduleId == moduleId
    );

    switch (method) {
      case "GET":
        if (askedPermission[0].view) {
          next();
        }
        break;
      case "PUT":
        if (askedPermission[0].modify) {
          next();
        }
        break;
      case "PATCH":
        if (askedPermission[0].modify) {
          next();
        }
        break;
      case "POST":
        if (askedPermission[0].add) {
          next();
        }
        break;
      case "DELETE":
        if (askedPermission[0].delete) {
          next();
        }
        break;
    }
    res.send(
      createHttpError(401, {
        message: `You can not access this resource`,
      })
    );
  } else {
    next();
  }
};
