import { NextFunction, Request, Response } from "express";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";

export const createBusinessUser = async (req:Request, res: Response, next: NextFunction) => {
    try {
        const payload = req.body;
        payload.email = payload.email.trim().toLocaleLowerCase();

        res.send(
            createResponse(payload, "Business group created successfully!")
        );
    } catch (error: any) {
        throw createHttpError(400, {
            message: error?.message ?? "An error occurred.",
            data: { user: null },
        })
    }
}
