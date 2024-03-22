import { NextFunction, Request, Response } from "express";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";
import Modules from "../schema/Modules";

export const createModule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { moduleId, title, basePath } = req.body;
    if (moduleId) {
      await Modules.create({
        moduleId,
        title,
        basePath,
      });
      res.send(createResponse({}, "Sub-Module created Succesfully!"));
    } else {
      await Modules.create({
        title,
        basePath,
        moduleId: null,
      });
      res.send(createResponse({}, "Module created Succesfully!"));
    }
    
  } catch (error: any) {
    throw createHttpError(400, {
      message: error?.message ?? "An error occurred.",
      data: { user: null },
    });
  }
};

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
                    as: "submodules"
                }
            },
            {
                $match : {
                    moduleId : null
                }
            },
            {
                $project: {
                    title: 1,
                    basePath: 1,
                    submodules: {
                        $map: {
                            input: "$submodules",
                            as: "submodule",
                            in: {
                                title: "$$submodule.title",
                                baseUrl: "$$submodule.basePath"
                            }
                        }
                    }
                }
            }
        ]);

      res.send(createResponse({data}));
    } catch (error: any) {
      throw createHttpError(400, {
        message: error?.message ?? "An error occurred.",
        data: { user: null },
      });
    }
  };
  