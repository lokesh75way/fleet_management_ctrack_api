import express from "express";
import passport from "passport";
import asyncHandler from "express-async-handler"
import { catchError, validate } from "../middleware/validation";
import { createModule, getAllModules,  } from "../controllers/Modules";

const router = express.Router();

// api to create module and submodule
router.post("/", validate("module:add"), catchError, asyncHandler(createModule));

// list all module with submodules
router.get("/",catchError, asyncHandler(getAllModules))

export default router;