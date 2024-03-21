import { type NextFunction, type Request, type Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { type IUser, UserRole } from "../schema/User";
import createHttpError from "http-errors";

export const roleAuth = (...roles: UserRole[]): any =>
  expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = req.user as IUser;
      if (user.role == null || !Object.values(UserRole).includes(user.role)) {
        throw createHttpError(401, { message: "Invalid user role" });
      }
      if (!roles.includes(user.role)) {
        const type =
          user.role.slice(0, 1) + user.role.slice(1).toLocaleLowerCase();

        throw createHttpError(401, {
          message: `${type} can not access this resource`,
        });
      }
      next();
    }
  );
