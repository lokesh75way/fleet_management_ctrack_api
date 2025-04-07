import { NextFunction, Request, Response } from "express";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";
import Modules from "../schema/Modules";
import Permission from "../schema/Permission";
import mongoose from "mongoose";
import { UserRole } from "../schema/User";

export const createTemplate = async (req: Request, res: Response) => {
  const { name, permission } = req.body;
  const permissions = await Permission.findOne({ name });
  if (permissions) {
    res.send(createResponse({}, "Name must be unique"));
    return;
  }
  // @ts-ignore
  const userId = req.user?._id;
  const newPermission = new Permission({
    name,
    permission,
    createdBy: userId,
  });
  const data = await newPermission.save();

  res.send(createResponse(data, "Feature template created succesfully"));
};

export const getAllTemplates = async (req: Request, res: Response) => {
  const query: any = {
    deleted: false,
    // name: {
    //   $nin: [
    //     process.env.ADMIN_TEMPLATE,
    //     process.env.GROUP_TEMPLATE,
    //     process.env.COMPANY_TEMPLATE,
    //   ],
    // },
  };

  // @ts-ignore
  const role = req.user.role;
  if (role !== UserRole.SUPER_ADMIN) {
    // @ts-ignore
    query.createdBy = req.user?._id;
  }

  let { page, limit } = req.query;
  let page1 = parseInt(page as string) || 1;
  let limit1 = parseInt(limit as string) || 10;

  const totalCount = await Permission.countDocuments(query);
  const totalPages = Math.ceil(totalCount / limit1);
  const startIndex = (page1 - 1) * limit1;
  const data = await Permission.find(query)
    .limit(limit1)
    .skip(startIndex)
    .sort({ _id: -1 });

  res.send(createResponse({ data, totalCount, totalPages }));
};

export const getTemplateById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const query: any = {
    deleted: false,
    _id: new mongoose.Types.ObjectId(id),
  };
  const data = await Permission.findOne(query);
  res.send(createResponse({ data }));
};

export const updateFeatureTemplate = async (req: Request, res: Response) => {
  const { _id, name, permission } = req.body;
  const existTemplate = await Permission.findOne({ _id });
  if (!existTemplate) {
    res.send(createHttpError(404, "Template not found"));
    return;
  }
  const data = await Permission.updateOne({ _id }, { name, permission });
  res.send(createResponse(data, "Feature template updated successfully!"));
};

export const deletePermission = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await Permission.findOne({ _id: id });

  if (!data) {
    res.send(createHttpError(404, "Template not found!"));
    return;
  }

  if (data.deleted) {
    res.send(createHttpError(400, "template is already deleted"));
    return;
  }
  await Permission.deleteById(id);
  res.send(createResponse({}, "User deleted successfully!"));
};
