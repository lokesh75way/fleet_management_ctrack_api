import { AccessControl } from "accesscontrol";
import { NextFunction, Request, Response } from "express";
import Permission from "../schema/Permission";
import User, { UserRole } from "../schema/User";

const ac = new AccessControl();

export const checkPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const query: any = req.query || req.user;
  // @ts-ignore
  const role = req.user.role;
  const method = req["method"];
  const url = req.baseUrl.replace("/api", "");

  console.log("url", url, role);

  if (role === UserRole.SUPER_ADMIN) {
    next();
    return;
  }

  const data = await Permission.findOne({
      role: role,
      endPoint: url,
      method: method,
  });


};
