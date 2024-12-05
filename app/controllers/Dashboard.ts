import { NextFunction, Request, Response } from "express";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";
import moment from "moment";
import Task from "../schema/Task";
import Trip from "../schema/Trip";

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
    const fleetUsage = {
        groups: {
            buisnesses: 100,
            companies: 200,
            users: 50
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
            { title: "Abu Dhabi", country: "Uae", value: 60, lat: 25.2233, lon: 55.2869},
            { title: "India", country: "India", value: 20, lat: 28.652, lon: 77.212 },
            { title: "Sharjah", country: "Uae", value: 3, lat: 25.3197, lon: 55.5463 },
            { title: "Ajman", country: "Uae", value: 10, lat: 25.1821, lon: 55.6703 },
            { title: "Umm Al-Quwain", country: "Uae", value: 7, lat: 25.5830, lon: 55.6263 }
        ]
    }
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


