import { NextFunction, Request, Response } from "express";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";
import Task from "../schema/Task";
import Technician from "../schema/Technician";

export const createTechnicianTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body;
  
  // @ts-ignore
  const id = req.user._id;

  const technician = await Technician.findById({ _id: payload.technician });
  if (!technician) {
    throw createHttpError(400, "Invalid technician! Please select valid technician");
  }

  const createdTrip = await Task.create({...payload, createdBy : id});

  if (!createdTrip) {
    res.send(createHttpError(400, "Task is not created!"));
  }

  res.send(createResponse(createdTrip, "Task created successfully!"));
};

export const getTechnicianTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { page, limit } = req.query;
  let page1 = parseInt(page as string) || 1;
  let limit1 = parseInt(limit as string) || 10;

  const startIndex = (page1 - 1) * limit1;

  let data = await Task.find({ deleted: false })
    .sort({ createdAt: -1 })
    .limit(limit1)
    .skip(startIndex)
    .populate("technician");
    

  const totalCount = await Task.countDocuments({deleted : false});

  res.send(createResponse({ data, totalCount }));
};

export const getTechnicianTasksById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;

  const data = await Task.findOne({ _id: id, deleted: false });

  if (!data) {
    res.send(createHttpError(404, "Not found"));
  } else {
    res.send(createResponse(data));
  }
};

export const deleteTechnicianTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;

  const task = await Task.findOne({ _id: id });

  if (!task) {
    res.send(createHttpError(404, "Not found"));
    return;
  }

  const alreadyDeleted = await Task.findOne({_id : id, deleted: true });

  if(alreadyDeleted){
    res.send(createHttpError(404, "Already deleted"));
    return;
  }
  const updatedTask = await Task.updateOne({ _id: id }, { deleted: true });

  if(updatedTask.modifiedCount === 0){
    res.send(createHttpError(400, "Task is not deleted!"));
    return;
  }

  res.send(createResponse(updatedTask, "Task Deleted successfully!"));
};


export const updateTechnicianTasks = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const id = req.params.id;
    const payload = req.body;

    const technician = await Technician.findById({ _id: payload.technician });
    if (!technician) {
      throw createHttpError(400, "Invalid technician! Please select valid technician");
    }
  
    const task = await Task.findOne({ _id: id });
  
    if (!task) {
      res.send(createHttpError(404, "Not found"));
      return;
    }
   
    const updatedTask = await Task.updateOne({ _id: id },payload);
  
    if(updatedTask.modifiedCount === 0){
      res.send(createHttpError(400, "Task is not updated!"));
      return;
    }
  
    res.send(createResponse(updatedTask, "Task updated successfully!"));
  };
  