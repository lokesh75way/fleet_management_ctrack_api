import { NextFunction, Request, Response } from "express";
import Trip, { TripStatus } from "../schema/Trip";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";
import { sendEmail, subadminInvitationEmailTemplate } from "../services/email";
import { generatePasswordToken } from "../services/passport-jwt";
import Permission from "../schema/Permission";

export const addTrip = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.body;
    // @ts-ignore
    const id = req.user._id;
    payload.createdBy = id;
    payload.lastModifiedBy = id;
    console.log(payload);
    const checkIfExist = await Trip.findOne({ payload });
    console.log(payload);
    if (checkIfExist) {
      throw createHttpError(400, {
        message: `Trip already exist!`,
      });
    }
    const createdTrip = await new Trip(payload).save();

    res.send(createResponse(createdTrip, "Trip created successfully!"));
  } catch (error) {
    throw createHttpError(400, {
      message: error ?? "An error occurred.",
      data: { user: null },
    });
  }
};

export const deleteTrip = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const condition = { _id: req.params.id };

    const updateData = await Trip.findOneAndUpdate(condition, {
      isDeleted: true,
    });
    if (!updateData) {
      throw createHttpError(400, {
        message: `Failed to delete Trip!`,
        data: { user: null },
      });
    }

    res.send(createResponse({}, `Trip deleted successfully!`));
  } catch (error) {
    throw createHttpError(400, {
      message: error ?? "An error occurred.",
      data: { user: null },
    });
  }
};

export const getAllTrips = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const condition = {
      isDeleted: false,
    };
    const data = await Trip.find(condition).sort({
      createdAt: -1,
    });
    const count = await Trip.count(condition);

    res.send(createResponse({ data, count }, `Trip found successfully!`));
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};

export const getTripById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tripId = req.params.id;
    const condition = {
      isDeleted: false,
      _id: tripId,
    };
    const data = await Trip.findOne(condition).sort({
      createdAt: -1,
    });

    res.send(createResponse({ data }, `Trip found successfully!`));
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};

export const updateTrip = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tripId = req.params.id;
    const payload = req.body;
    console.log(payload);
    const condition = {
      isDeleted: false,
      _id: tripId,
    };

    const trip = await Trip.findById(tripId);

    if (!trip) {
      res.send(createHttpError(404, "Not found"));
      return;
    }

    const data = await Trip.findOneAndUpdate(condition, payload);

    res.send(createResponse({ data }, `Trip Updated successfully!`));
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};
