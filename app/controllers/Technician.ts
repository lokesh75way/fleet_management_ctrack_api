import { NextFunction, Request, Response } from "express";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";
import Task, { TaskCategory } from "../schema/Task";
import Technician from "../schema/Technician";
import User, { UserRole } from "../schema/User";
import Company from "../schema/Company";
import CompanyBranch from "../schema/CompanyBranch";

export const createTechnician = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body;

  // @ts-ignore
  const id = req.user._id;

  let exists = await Technician.findOne({ technicianNo: payload.technicianNo });

  if (exists) {
    res.send(
      createHttpError(
        409,
        "Technician with this Technician Number already exists"
      )
    );
    return;
  }

  exists = await Technician.findOne({ email: payload.email });

  if (exists) {
    res.send(createHttpError(409, "Technician with this email already exists"));
    return;
  }

  exists = await Technician.findOne({ mobileNumber: payload.mobileNumber });

  if (exists) {
    res.send(
      createHttpError(409, "Technician with this mobile number already exists")
    );
    return;
  }

  const companyExists = await Company.findOne({ _id: payload.company });
  if (!companyExists) {
    throw createHttpError(404, "company doesn't exist!");
  }

  const technician = await Technician.create({ ...payload, createdBy: id });

  if (!technician) {
    res.send(createHttpError(400, "Technician is not created"));
    return;
  }

  res.send(createResponse(technician, "Trip created successfully!"));
};

export const getTechnician = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req.user._id;
  // @ts-ignore
  const role = req.user.role;
  const { branchId, companyId, groupId } = req.query;
  const query: any = { deleted: false };

  if (role === UserRole.COMPANY) {
    const companyId = await User.findById(userId);

    if (companyId) {
      query["$or"] = [{ createdBy: userId }, { company: companyId.companyId }];
    }
  }

  let companies;
  if (role === UserRole.BUSINESS_GROUP) {
    const businessGroupId = await User.findOne({ _id: userId }).select(
      "businessGroupId"
    );
    if (businessGroupId) {
      const filter: any = {
        businessGroupId: businessGroupId.businessGroupId,
      };
      if (companyId) filter._id = companyId;
      companies = await Company.find(filter).select("_id");
    }

    const companyIds = companies?.map((company) => company._id);
    query["$or"] = [
      { createdBy: userId },
      {
        company: {
          $in: companyIds,
        },
      },
    ];
  }

  if (role === UserRole.SUPER_ADMIN) {
    if (companyId) query.company = companyId;
    if (groupId) {
      const companies = await Company.find({ businessGroupId: groupId });
      if (companies) {
        query.company = { $in: companies.map((company) => company._id) };
      }
    }
    if (branchId) {
      const companies = await CompanyBranch.find({
        _id: { $in: (branchId as string).split(",") },
      });
      if (companies) {
        query.company = { $in: companies.map((company) => company._id) };
      }
    }
  }

  if (role === UserRole.USER) {
    const user = await User.findById(userId);
    if (user) {
      query["$or"] = [{ createdBy: userId }, { company: user.companyId }];
    }
  }

  const page = parseInt((req.query.page as string) || "1");
  const limit = parseInt((req.query.limit as string) || "10");

  const startIndex = (page - 1) * limit;

  const technicians = await Technician.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  const count = await Technician.countDocuments(query);

  // Fetch all tasks and calculate category percentages
  const tasks = await Task.find({});
  const totalTasks = tasks.length;

  let installationCount = 0;
  let maintenanceCount = 0;

  tasks.forEach((task) => {
    if (task.taskCategory === TaskCategory.INSTALLATION) installationCount++;
    if (task.taskCategory === TaskCategory.MAINTAINANCE) maintenanceCount++;
  });

  const installationPercentage = totalTasks
    ? (installationCount / totalTasks) * 100
    : 0;
  const maintenancePercentage = totalTasks
    ? (maintenanceCount / totalTasks) * 100
    : 0;

  const taskSummary = {
    totalTasks,
    installationCount,
    maintenanceCount,
    installationPercentage: installationPercentage.toFixed(2),
    maintenancePercentage: maintenancePercentage.toFixed(2),
  };

  res.send(createResponse({ technicians, count, taskSummary }));
};

export const getTechnicianById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;

  // @ts-ignore
  const user = req.user._id;

  const data = await Technician.findOne({ _id: id, deleted: false });
  res.send(createResponse(data));
};

export const deleteTechnician = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;

  const technician = await Technician.findOne({ _id: id, deleted: true });

  if (technician) {
    throw createHttpError(404, "Not found");
  }

  const updatedTask = await Technician.updateOne(
    { _id: id },
    { deleted: true }
  );

  res.send(createResponse(updatedTask, "Task Deleted successfully!"));
};

export const updateTechnician = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  const payload = req.body;

  let technician = await Technician.findOne({ _id: id, deleted: false });

  if (!technician) {
    res.send(createHttpError(404, "Not found"));
    return;
  }

  if (payload.email) {
    technician = await Technician.findOne({
      _id: { $ne: req.params.id },
      email: payload.email,
    });

    if (technician) {
      res.send(
        createHttpError(409, "Technician with this email already exists!")
      );
      return;
    }
  }
  if (payload.technicianNo) {
    technician = await Technician.findOne({
      _id: { $ne: req.params.id },
      technicianNo: payload.technicianNo,
    });

    if (technician) {
      res.send(
        createHttpError(
          409,
          "Technician with this technicianNo already exists!"
        )
      );
      return;
    }
  }

  if (payload.mobileNumber) {
    technician = await Technician.findOne({
      _id: { $ne: req.params.id },
      mobileNumber: payload.mobileNumber,
    });

    if (technician) {
      res.send(
        createHttpError(
          409,
          "Technician with this mobile number already exists!"
        )
      );
      return;
    }
  }

  const updatedTechnician = await Technician.updateOne(
    { _id: id, deleted: false },
    payload
  );

  if (updatedTechnician.modifiedCount === 0) {
    res.send(createHttpError(400, "Technician is not updated!"));
    return;
  }

  res.send(
    createResponse(updatedTechnician, "Technician updated successfully!")
  );
};
