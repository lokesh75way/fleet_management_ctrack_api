import { NextFunction, Request, Response } from "express";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";
import moment from "moment";
import Task from "../schema/Task";
import Trip from "../schema/Trip";
import User, { IUser, UserRole } from "../schema/User";
import { Types } from "mongoose";
import CompanyBranch from "../schema/CompanyBranch";
interface ActiveUser {
    title: string;
    country: string;
    value: string;
    lat: string;
    long: string;
}

interface FleetUsage {
    groups: {
        total: number;
        businesses: number;
        companies: number;
        users: number;
    };
    vehicle: {
        running: number;
        idle: number;
        stopped: number;
        total: number;
    };
    applicationUsage: {
        mobile: number;
        web: number;
    };
    activeUsers: ActiveUser[];
    percentage: any[]
}

export const getFleetStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Fetch counts for each trip status
    const completeCount = await Trip.countDocuments({ tripStatus: "COMPLETED" });
    const progressCount = await Trip.countDocuments({ tripStatus: "ONGOING" });
    const yetToStartCount = await Trip.countDocuments({
      tripStatus: "JUST_STARTED",
    });
    const cancelledCount = await Trip.countDocuments({ tripStatus: "CANCELLED" });

    // Prepare the fleet status response
    const fleetStatus = {
      complete: completeCount,
      progress: progressCount,
      yetToStart: yetToStartCount,
      cancelled: cancelledCount,
    };

    res.send(createResponse(fleetStatus, "Fleet status fetched successfully!"));
  } catch (error) {
    next(error);
  }
};


export const getFleetUsage = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { businessGroupId, companyId } = req.query;
    const businessQuery: any = { isDeleted: false, role: UserRole.BUSINESS_GROUP };
    const companyQuery: any = { isDeleted: false, role: UserRole.COMPANY }

    const fleetUsage: FleetUsage = {
        groups: {
            total: await User.countDocuments({ isDeleted: false}),
            businesses: await User.countDocuments(businessQuery),
            companies: await User.countDocuments(companyQuery),
            users: await User.countDocuments({
                isDeleted: false,
                role: { $nin: ["BUSINESS_GROUP", "COMPANY"] }
            })
        },
        vehicle: {
            running: 45,
            idle: 30,
            stopped: 25,
            total: 100
        },
        applicationUsage: {
            mobile: 50,
            web: 80
        },
        activeUsers: [
        ],
        percentage: []
    }
    let groups: any[] = []; 
    if (businessGroupId) {
        let matchCondition: any = { isDeleted: false, role: UserRole.COMPANY };
            matchCondition["$or"] = [{ businessGroupId: businessGroupId }];
            if (businessGroupId) {
                const businessGroupIdStr = Array.isArray(businessGroupId)
                  ? businessGroupId[0]
                  : businessGroupId; // Handle array cases
          
                // Ensure that businessGroupId is a valid string
                if (
                  typeof businessGroupIdStr === "string" &&
                  Types.ObjectId.isValid(businessGroupIdStr)
                ) {
                  matchCondition["$or"] = [
                    { businessGroupId: new Types.ObjectId(businessGroupIdStr) },
                  ];
                }
              }

            const companiesPipeline: any[] = [
                { $match: matchCondition },
                {
                    $lookup: {
                        from: "companies",
                        localField: "companyId",
                        foreignField: "_id",
                        as: "companyDetails",
                    },
                },
                { $unwind: { path: "$companyDetails", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "business-groups",
                        localField: "companyDetails.businessGroupId",
                        foreignField: "_id",
                        as: "businessGroupDetails",
                    },
                },
                { $unwind: { path: "$businessGroupDetails", preserveNullAndEmptyArrays: true } },
                {
                    $addFields: {
                        companyId: {
                            _id: "$companyDetails._id",
                            country: "$companyDetails.createdBy.country", // Only relevant fields
                        },
                    },
                },
                { $sort: { createdAt: -1 } },
            ];

            groups = await User.aggregate(companiesPipeline);

            if (groups && groups.length > 0) {
                const activeUsers = groups.map(group => ({
                    title: group._id,
                    country: group._id,
                    value: group.country,
                    lat: group.companyId.latitude,
                    long: group.companyId.longitude
                }));

                fleetUsage.activeUsers = activeUsers;
            }
    } else if (companyId) {
        const matchCondition: any = { isDeleted: false};
        matchCondition["$or"] = [{ companyId: companyId }];
            if (companyId) {
                const companyIdStr = Array.isArray(companyId)
                  ? companyId[0]
                  : companyId;
          
                if (
                  typeof companyIdStr === "string" &&
                  Types.ObjectId.isValid(companyIdStr)
                ) {
                  matchCondition["$or"] = [
                    { companyId: new Types.ObjectId(companyIdStr) },
                  ];
                }
              }
            groups = await CompanyBranch.find(matchCondition)
            .populate([
              { path: "businessGroupId"},
              { path: "companyId"},
              { path: "parentBranchId"},
            ])
            .sort({ createdAt: -1 })

        if (groups && groups.length > 0) {
            const activeUsers = groups.map(group => ({
                title: group._id.toString(),
                country: group._id.toString(),
                value: group.country,
                lat: group.latitude,
                long: group.longitude
                
            }));

            fleetUsage.activeUsers = activeUsers;
        }      
    } else {
        const query: any = { isDeleted: false, role: UserRole.BUSINESS_GROUP };
        groups = await User.aggregate([
            {
            $match: query,
            },
            {
            $lookup: {
                from: "business-groups",
                localField: "businessGroupId",
                foreignField: "_id",
                as: "businessGroup",
            },
            },
            {
            $unwind: {
                path: "$businessGroup",
                preserveNullAndEmptyArrays: true,
            },
            },
            {
            $addFields: {
                businessGroupId: "$businessGroup",
            },
            },
            {
            $unset: "businessGroup",
            },
            {
            $lookup: {
                from: "companies",
                let: { businessGroupId: "$businessGroupId._id" },
                pipeline: [
                {
                    $match: {
                    $expr: {
                        $and: [
                        { $eq: ["$businessGroupId", "$$businessGroupId"] },
                        { $eq: ["$isDeleted", false] },
                        ],
                    },
                    },
                },
                ],
                as: "companyCount",
            },
            },
            {
            $addFields: {
                companyCount: { $size: "$companyCount" },
            },
            },
            {
            $project: {
                password: 0,
            },
            },
            {
            $sort: {
                _id: -1,
            },
            }
        ]);
        if (groups && groups.length > 0) {
            const activeUsers = groups.map(group => ({
                title: group._id,
                country: group._id,
                value: group.country,
                lat: group.businessGroupId.latitude,
                long: group.businessGroupId.longitude
            }));

            fleetUsage.activeUsers = activeUsers;
        }
    }

    const totalCount: number = groups.length;

        const groupedByCountry = groups.reduce((acc: { country: string; count: number; percentage: number }[], group) => {
            const country = group.country;
            const existingGroup = acc.find((g) => g.country === country);
    
            if (!existingGroup) {
                acc.push({
                    country,
                    count: 1,
                    percentage: 0,
                });
            } else {
                existingGroup.count += 1;
            }
        
            return acc;
        }, [] as { country: string; count: number; percentage: number }[]);
        
        const percentage = groupedByCountry.map((group) => ({
            country: group.country,
            count: group.count,
            percentage: ((group.count / totalCount) * 100).toFixed(2),
        }));
        
        fleetUsage.percentage = percentage;
    res.send(createResponse(fleetUsage, "Fleet usage fetched successfully!"));
}

export const getOverspeed = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const overSpeed = {
        events: [
            {
                object: "Vehicle 1",
                noOfTimes: 10,
                maxSpeed: 120,
                overSpeedingDistance: 100,
                distance: 1000,
                driver: "Driver 1"
            },
            {
                object: "Vehicle 2",
                noOfTimes: 5,
                maxSpeed: 110,
                overSpeedingDistance: 50,
                distance: 500,
                driver: "Driver 2"
            },
            {
                object: "Vehicle 3",
                noOfTimes: 15,
                maxSpeed: 130,
                overSpeedingDistance: 150,
                distance: 1500,
                driver: "Driver 3"
            }
        ],
        maxSpeed: 130,
        alertCount: 30
    }
    res.send(createResponse(overSpeed, "Over speed fetched successfully!"));
}

export const getFleetFuel = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const fleetFuel = {
        fuelFill: {
            events: [
                {
                    object: "Vehicle 1",
                    date: "2021-10-10",
                    time: "10:00",
                    fuelLevelBefore: 100,
                    fuelLevelAfter: 120,
                    difference: 20
                },
                {
                    object: "Vehicle 2",
                    date: "2021-10-10",
                    time: "10:00",
                    fuelLevelBefore: 100,
                    fuelLevelAfter: 180,
                    difference: 80
                },
                {
                    object: "Vehicle 3",
                    date: "2021-10-10",
                    time: "10:00",
                    fuelLevelBefore: 100,
                    fuelLevelAfter: 140,
                    difference: 40
                }
            ],
            totalFuelFill: 140
        },
        fuelDrain: {
            events: [
                {
                    object: "Vehicle 1",
                    date: "2021-10-10",
                    time: "10:00",
                    fuelLevelBefore: 100,
                    fuelLevelAfter: 30,
                    difference: 70
                },
                {
                    object: "Vehicle 2",
                    date: "2021-10-10",
                    time: "10:00",
                    fuelLevelBefore: 100,
                    fuelLevelAfter: 80,
                    difference: 20
                },
                {
                    object: "Vehicle 3",
                    date: "2021-10-10",
                    time: "10:00",
                    fuelLevelBefore: 100,
                    fuelLevelAfter: 60,
                    difference: 40
                }
            ],
            totalFuelDrain: 130
        }
    }
    res.send(createResponse(fleetFuel, "Fleet fuel fetched successfully!"));
}

export const fleetIdle = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const fleetIdle = {
        events: [
            {
                object: "Vehicle 1",
                idleDuration: "10",
                approxFuelWastage: 100
            },
            {
                object: "Vehicle 2",
                idleDuration: "20",
                approxFuelWastage: 200
            },
            {
                object: "Vehicle 3",
                idleDuration: "30",
                approxFuelWastage: 300
            }
        ],
        totalIdleTime: "60",
        totalApproxFuelWastage: 600
    }
    res.send(createResponse(fleetIdle, "Fleet idle fetched successfully!"));
}

export const getMaintainanceReminder = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const maintainanceReminder = {
        events: [
            {
                maintainanceType: "Oil Change",
                due: "2024-10-10",
            },
            {
                maintainanceType: "Air Filter Change",
                due: "2024-04-25",
            },
            {
                maintainanceType: "Oil Filter Change",
                due: "2021-10-10",
            }
        ],
        dueEvents: 2,
        overdueEvents: 1
    }
    res.send(createResponse(maintainanceReminder, "Maintainance reminder fetched successfully!"));
}


export const getRenewalReminder = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const renewalReminder = {
        events: [
            {
                renewalType: "Insurance",
                due: "2024-10-10",
            },
            {
                renewalType: "Registration",
                due: "2024-04-25",
            },
            {
                renewalType: "License",
                due: "2021-10-10",
            }
        ],
        dueEvents: 2,
        overdueEvents: 1
    }
    res.send(createResponse(renewalReminder, "Renewal reminder fetched successfully!"));
}

export const getTasks = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const today = moment().startOf("day");
  
      // Fetch all tasks
      const allTasks = await Task.find({}).lean();
  
      // Initialize arrays for xAxis and task data
      const xAxis: string[] = [];
      const upcomingData: number[] = [];
      const missedData: number[] = [];
      const incompleteData: number[] = [];
      const completedData: number[] = [];
  
      // Group tasks by `plannedReportingDate`
      const taskMap = allTasks.reduce((map, task) => {
        const date = moment(task.plannedReportingDate).format("MM-DD-YY");
        if (!map[date]) {
          map[date] = { upcoming: 0, missed: 0, incomplete: 0, completed: 0 };
          xAxis.push(date);
        }
  
        const plannedDate = moment(task.plannedReportingDate).startOf("day");
        if (plannedDate.isAfter(today)) {
          map[date].upcoming++;
        } else if (plannedDate.isSame(today)) {
          map[date].incomplete++;
        } else if (plannedDate.isBefore(today)) {
          map[date].completed++;
        }
  
        return map;
      }, {} as Record<string, { upcoming: number; missed: number; incomplete: number; completed: number }>);
  
      // Populate the data arrays based on xAxis order
      xAxis.sort((a, b) => moment(a, "MM-DD-YY").diff(moment(b, "MM-DD-YY"))); // Sort xAxis by date
      xAxis.forEach((date) => {
        const taskData = taskMap[date] || {
          upcoming: 0,
          missed: 0,
          incomplete: 0,
          completed: 0,
        };
        upcomingData.push(taskData.upcoming);
        missedData.push(taskData.missed);
        incompleteData.push(taskData.incomplete);
        completedData.push(taskData.completed);
      });
  
      const tasks = {
        xAxis,
        series: [
          {
            name: "Upcoming Tasks",
            data: upcomingData,
          },
          {
            name: "Missed Tasks",
            data: missedData,
          },
          {
            name: "Incomplete Tasks",
            data: incompleteData,
          },
          {
            name: "Completed Tasks",
            data: completedData,
          },
        ],
      };
  
      res.send(createResponse(tasks, "Tasks fetched successfully!"));
    } catch (error) {
      next(error);
    }
  };


