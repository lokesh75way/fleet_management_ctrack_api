import { NextFunction, Request, Response } from "express";
import User, { UserRole, IUser, UserType } from "../schema/User";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";
import { sendEmail, subadminInvitationEmailTemplate } from "../services/email";
import { generatePasswordToken } from "../services/passport-jwt";
import Permission from "../schema/Permission";


export const addSubAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = req.body;
        payload.email = payload.email.trim().toLocaleLowerCase();
        const checkIfExist = await User.findOne({ email: payload.email });
        console.log(payload)
        if(checkIfExist) {
            throw createHttpError(400, {
                message: `Subadmin already exist with this email!`,
            });
        }
        const createSubadmin = await new User(payload).save();

        const token = await generatePasswordToken(createSubadmin);
        const html = subadminInvitationEmailTemplate(token, payload.email);
        const send = sendEmail({
            to: payload.email, 
            subject: "Registration For App", 
            html: html
        })

        res.send(
            createResponse(createSubadmin, "Subadmin created successfully!")
        );
    } catch (error) {
        throw createHttpError(400, {
            message: error ?? "An error occurred.",
            data: { user: null },
        });
    }
} 

export const updateSubAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = req.body;
        const condition = { _id: req.params.id };
        const options = { new: true };

        const updateData = await User.findOneAndUpdate( condition, payload, options ).select("-password");

        if (!updateData) {
            throw createHttpError(400, {
                message: `Failed to update subadmin!`,
                data: { user: null },
            });
        }
        res.send(
            createResponse(updateData, `Subadmin updated successfully!`)
        );
    } catch (error) {
        throw createHttpError(400, {
            message: error,
            data: { user: null },
        })
    }
}

export const deleteSubAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const condition = { _id: req.params.id };

        const updateData = await User.findOneAndUpdate( condition, { isDeleted: true } ).select("-password");
        if (!updateData) {
            throw createHttpError(400, {
                message: `Failed to update subadmin!`,
                data: { user: null },
            });
        }

        res.send(
            createResponse({}, `Subadmin updated successfully!`)
        );

    } catch (error) {
        throw createHttpError(400, {
            message: error ?? "An error occurred.",
            data: { user: null },
        })
    }
}

export const getAllSubadmin = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const page = parseInt((req.query.page as string) || "1");
        const limit = parseInt((req.query.limit as string) || "10");
      
        const startIndex = (page - 1) * limit;
      

        const condition = {
            isDeleted: false,
            role: { $in: [UserRole.SUPER_ADMIN, UserRole.USER] },
            type: { $in: [UserType.STAFF, UserType.ADMIN] },
        };
        const data = await User.find(condition).select("-password").sort({
            createdAt: -1
        }).skip(startIndex).limit(limit);
        const count = await User.count(condition);

        res.send(
            createResponse({data, count}, `Subadmin found successfully!`)
        );

    } catch (error: any) {
        throw createHttpError(400, {
            message: error?.message ?? "An error occurred.",
            data: { user: null },
        })
    }
}