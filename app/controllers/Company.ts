import { NextFunction, Request, Response } from "express";
import { createResponse } from "../helper/response";
import createHttpError from "http-errors";
import Company from "../schema/Company";


export const createCompany = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = req.body;
    } catch (error) {
        
    }
}