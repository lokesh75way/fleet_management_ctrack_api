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

  // const endPoint = data?.module?.endPoint; // for dynamic from db
  //   const endPoint = url;

  // if (data && role && role === UserRole.SUPER_ADMIN) {
  //   const access = await ac.grant(UserRole.SUPER_ADMIN);
  //   if (method == "GET") {
  //     await ac.grant(UserRole.SUPER_ADMIN).readAny(endPoint);
  //     const permission = await ac.can(role).readAny(url);
  //     if (permission.granted) {
  //       next();
  //     } else {
  //       res.status(403).send();
  //     }
  //   }
  //   if (method == "POST") {
  //     await ac.grant(UserRole.SUPER_ADMIN).createOwn(endPoint);
  //     const permission = await ac.can(role).createOwn(url);
  //     if (permission.granted) {
  //       next();
  //     } else {
  //       res.status(403).send();
  //     }
  //   }
  //   if (method == "PUT") {
  //     await ac.grant(UserRole.SUPER_ADMIN).updateAny(endPoint);
  //     const permission = await ac.can(role).updateAny(url);
  //     if (permission.granted) {
  //       next();
  //     } else {
  //       res.status(403).send();
  //     }
  //   }
  //   if (method == "DELETE") {
  //     await ac.grant(UserRole.SUPER_ADMIN).deleteAny(endPoint);
  //     const permission = await ac.can(role).deleteAny(url);
  //     if (permission.granted) {
  //       next();
  //     } else {
  //       res.status(403).send();
  //     }
  //   }
  //   if (method == "PATCH") {
  //     await ac.grant(UserRole.SUPER_ADMIN).update(endPoint);
  //     const permission = await ac.can(role).update(url);
  //     if (permission.granted) {
  //       next();
  //     } else {
  //       res.status(403).send();
  //     }
  //   }
  //   return false;
  // } else {
  //   res.status(401).send({
  //     success: false,
  //     message: "Unauthorize access",
  //   });
  // }
};
