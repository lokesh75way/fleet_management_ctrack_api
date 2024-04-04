import { NextFunction, Request, Response } from "express";
import Trip, {TripStatus} from "../schema/Trip";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";
import { sendEmail, subadminInvitationEmailTemplate } from "../services/email";
import { generatePasswordToken } from "../services/passport-jwt";
import Permission from "../schema/Permission";


export const addTrip = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = req.body;
        // @ts-ignore
        const id = req.user._id;
        payload.createdBy = id;
        payload.lastModifiedBy = id;
        console.log(payload)
        const checkIfExist = await Trip.findOne({ payload });
        console.log(payload)
        if(checkIfExist) {
            throw createHttpError(400, {
                message: `Trip already exist!`,
            });
        }
        const createdTrip = await new Trip(payload).save();


        res.send(
            createResponse(createdTrip, "Trip created successfully!")
        );
    } catch (error) {
        throw createHttpError(400, {
            message: error ?? "An error occurred.",
            data: { user: null },
        });
    }
} 


export const deleteTrip = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const condition = { _id: req.params.id };

        const updateData = await Trip.findOneAndUpdate( condition, { isDeleted: true } );
        if (!updateData) {
            throw createHttpError(400, {
                message: `Failed to delete Trip!`,
                data: { user: null },
            });
        }

        res.send(
            createResponse({}, `Trip deleted successfully!`)
        );

    } catch (error) {
        throw createHttpError(400, {
            message: error ?? "An error occurred.",
            data: { user: null },
        })
    }
}

export const getAllTrips = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const condition = {
            isDeleted: false,
        };
        const data = await Trip.find(condition).sort({
            createdAt: -1
        });
        const count = await Trip.count(condition);

        res.send(
            createResponse({data, count}, `Trip found successfully!`)
        );

    } catch (error: any) {
        throw createHttpError(400, {
            message: error?.message ?? "An error occurred.",
            data: { user: null },
        })
    }
}