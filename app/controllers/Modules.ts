import { NextFunction, Request, Response } from "express";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";
import Modules from "../schema/Modules";
import Permission from "../schema/Permission";

export const getAllModules = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await Modules.aggregate([
      {
        $lookup: {
          from: "modules",
          localField: "_id",
          foreignField: "moduleId",
          as: "subModules",
        },
      },
      {
        $match: {
          moduleId: null,
        },
      },
      {
        $project: {
          title: 1,
          basePath: 1,
          subModules: {
            $map: {
              input: "$subModules",
              as: "subModule",
              in: {
                id: "$$subModule._id",
                title: "$$subModule.title",
                basePath: "$$subModule.basePath",
              },
            },
          },
        },
      },
    ]);

    res.send(createResponse(data));
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};


export const createModule = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { moduleId, title, basePath } = req.body;
      if (moduleId) {
        const data = await Modules.create({
          moduleId,
          title,
          basePath,
        });
        res.send(createResponse(data, "Sub-Module created Succesfully!"));
      } else {
        const data = await Modules.create({
          title,
          basePath,
          moduleId: null,
        });
        res.send(createResponse(data, "Module created Succesfully!"));
      }
    } catch (error: any) {
      throw createHttpError(400, {
        message: error?.message ?? "An error occurred.",
        data: { user: null },
      });
    }
  };
