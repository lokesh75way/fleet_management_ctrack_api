import { NextFunction, Request, Response } from "express";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";
import Modules from "../schema/Modules";
import Permission from "../schema/Permission";

export const createTemplate = async (req: Request, res: Response) => {
  const { name, permission } = req.body;

  const newPermission = new Permission({ name, permission });
  const data = await newPermission.save();

  res.send(createResponse(data, "Feature template created succesfully"));
};

export const getAllTemplates = async (req: Request, res: Response) => {
  const data = await Permission.find();
  res.send(createResponse(data));
};
