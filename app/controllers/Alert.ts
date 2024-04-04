import { NextFunction, Request, Response } from "express";
import Alert from "../schema/Alerts";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";


export const addAlert = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = req.body;
        console.log(payload)

        const checkIfExist = await Alert.findOne({ alertName: payload.alertName });
        console.log(payload)
        if(checkIfExist) {
            throw createHttpError(400, {
                message: `Alert already exist with this name!`,
            });
        }
        const createAlert = await new Alert(payload).save();

        res.send(
            createResponse(createAlert, "Alert created successfully!")
        );
    } catch (error) {
        throw createHttpError(400, {
            message: error ?? "An error occurred.",
            data: { user: null },
        });
    }
} 

export const updateAlert = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = req.body;
        const condition = { _id: req.params.id };
        const options = { new: true };

        const updateData = await Alert.findOneAndUpdate( condition, payload, options );

        if (!updateData) {
            throw createHttpError(400, {
                message: `Failed to update Alert!`,
                data: { user: null },
            });
        }
        res.send(
            createResponse(updateData, `Alert updated successfully!`)
        );
    } catch (error) {
        throw createHttpError(400, {
            message: error,
            data: { user: null },
        })
    }
}

export const deleteAlert = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const condition = { _id: req.params.id };

        const updateData = await Alert.findOneAndUpdate( condition, { isDeleted: true } );
        if (!updateData) {
            throw createHttpError(400, {
                message: `Failed to delete Alert!`,
                data: { user: null },
            });
        }

        res.send(
            createResponse({}, `Alert deleted successfully!`)
        );

    } catch (error) {
        throw createHttpError(400, {
            message: error ?? "An error occurred.",
            data: { user: null },
        })
    }
}

export const getAllAlerts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const condition = {
            isDeleted: false,
        };
        const data = await Alert.find(condition).sort({
            createdAt: -1
        });
        const count = await Alert.count(condition);

        res.send(
            createResponse({data, count}, `Alert found successfully!`)
        );

    } catch (error: any) {
        throw createHttpError(400, {
            message: error?.message ?? "An error occurred.",
            data: { user: null },
        })
    }
}