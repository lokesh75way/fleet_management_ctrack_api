import { NextFunction, Request, Response } from "express";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";

export const getFleetStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const fleetStatus = {
        complete: 100,
        progress: 200,
        yetToStart: 50,
        Cancelled: 10
    }
    res.send(createResponse(fleetStatus, "Fleet status fetched successfully!"));
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
        activeUsers: {
            "Abu Dhabi": 80,
            "Dubai": 30,
            "Sharjah": 50,
            "Ajman": 40,
            "Umm Al-Quwain": 14
        }
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
    const tasks = {
        "2022-01-01": {
            upcoming: 2,
            missed: 1,
            completed: 3,
            incomplete: 1
        },
        "2022-01-02": {
            upcoming: 1,
            missed: 0,
            completed: 2,
            incomplete: 2
        },
        "2022-01-03": {
            upcoming: 3,
            missed: 1,
            completed: 1,
            incomplete: 2
        },

    };
    res.send(createResponse(tasks, "Tasks fetched successfully!"));
}


