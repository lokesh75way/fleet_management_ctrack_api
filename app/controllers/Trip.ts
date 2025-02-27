import { NextFunction, Request, Response } from "express";
import Trip, { TripStatus } from "../schema/Trip";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";
import Driver from "../schema/Driver";
import Vehicle from "../schema/Vehicle";

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
    const checkIfExist = await Trip.findOne({ payload });
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
    const condition: any = {
      isDeleted: false,
      tripStatus: "JUST_STARTED",
    };
    const limit = parseInt((req.query.limit as string) || "10");
    const page = parseInt((req.query.page as string) || "1");

    const status = req.query.status as string;

    if (status) {
      condition["tripStatus"] = status;
    }

    if (req.query.driver) {
      condition["driverId"] = req.query.driver;
    }

    if (req.query.vehicle) {
      condition["vehicle"] = req.query.vehicle;
    }

    if (req.query.start) {
      condition["startTime"] = { $gte: req.query.start };
    }

    if (req.query.end) {
      condition["reachTime"] = { $lte: req.query.end };
    }

    const startIndex = (page - 1) * limit;

    const data = await Trip.find(condition)
      .populate({
        path: "driver",
        select: "firstName lastName",
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

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

    if (!data) {
      throw createHttpError(404, "Trip not found");
    }

    res.send(createResponse(data, `Trip found successfully!`));
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
    const condition = {
      isDeleted: false,
      _id: tripId,
    };

    const trip = await Trip.findById(tripId);
    const driver = await Driver.findById({ _id: payload.driverId });
    const vehicle = await Vehicle.findById({ _id: payload.vehicleId });

    if (!trip) {
      throw createHttpError(404, "Trip not found");
    }

    if (!driver) {
      throw createHttpError(400, "Invalid driver! Please select valid driver");
    }

    if (!vehicle) {
      throw createHttpError(
        400,
        "Invalid vehicle! Please select valid vehicle"
      );
    }

    const data = await Trip.findOneAndUpdate(condition, payload);

    res.send(createResponse({ data }, `Trip updated successfully!`));
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};
