import dotenv from "dotenv";
import express, { type Express, type Request, type Response } from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import http from "http";
import fileUpload from "express-fileupload";

import errorHandler from "./app/middleware/errorHandler";
import { initDB } from "./app/services/initDB";

import authRoutes from "./app/routes/auth";
import userRoutes from "./app/routes/user";
import modules from "./app/routes/modules";
import featureTemplate from "./app/routes/featureTemplate";
import businessGroup from "./app/routes/businessGroup";
import companyRoutes from "./app/routes/company";
import branchRoutes from "./app/routes/branch";
import profileRoutes from "./app/routes/profileRoutes";
import vehicleRoutes from "./app/routes/vehicle";
import driverRoutes from "./app/routes/driver";
import tripRoutes from "./app/routes/trip";
import alertRoutes from "./app/routes/alert";
import fileRoutes from './app/routes/file-upload'
import technicianTaskRoutes from './app/routes/technicianTask';
import technicianRoutes from './app/routes/technician'
import geoFenceRoutes from './app/routes/geoFence';
import expenseRoutes from './app/routes/expense'
import dashboardRoutes from './app/routes/dashboard'

import { initPassport } from "./app/services/passport-jwt";
import passport from "passport";
import { roleAuth } from "./app/middleware/roleAuth";
import { UserRole } from "./app/schema/User";
import cors from "cors";
import path from "path";
import { initTeltonikaServer } from "./app/services/Teltonika";
import {initJT701Server} from "./app/services/JT701";
import { initCronJob} from "./app/services/cronJob"
import { createAdmin } from "./app/helper/createAdmin";
import swaggerUi from 'swagger-ui-express';
import { mergeSwaggerFiles } from "./app/merge.swagger";
const mergedSwagger = mergeSwaggerFiles();
const envFilePath = path.resolve(`./.env.${process.env.NODE_ENV}`);
dotenv.config({ path: envFilePath });

const port = Number(process.env.PORT) ?? 5000;
const app: Express = express();
const router = express.Router();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(morgan("dev"));
app.use(cors({
  origin: '*',
  methods: ['GET', 'HEAD', 'POST', 'DELETE', 'PUT', 'PATCH'],
  allowedHeaders: '*',
}));
app.use(
  fileUpload({
    useTempFiles: true,
  })
);


const initApp = async (): Promise<void> => {
  // init mongodb
  await initDB();
  // passport init
  initPassport();

  // set base path to /api
  app.use("/api/fleet", router);

  app.get("/", (req: Request, res: Response) => {
    res.send({ status: "ok" });
  });

  // permission
  const adminAccess = [passport.authenticate("jwt", { session: false }), roleAuth(UserRole.SUPER_ADMIN , UserRole.BUSINESS_GROUP , UserRole.COMPANY, UserRole.USER)];
  const businessGroupAccess = [
    passport.authenticate("jwt", { session: false }),
    roleAuth(UserRole.SUPER_ADMIN, UserRole.BUSINESS_GROUP , UserRole.COMPANY),
  ];
  const companyAccess = [
    passport.authenticate("jwt", { session: false }),
    roleAuth(UserRole.SUPER_ADMIN, UserRole.COMPANY, UserRole.BUSINESS_GROUP , UserRole.USER),
  ];

  // routes
  router.use('/docs', swaggerUi.serve, swaggerUi.setup(mergedSwagger));
  router.use("/auth", authRoutes);
  router.use("/feature-template", adminAccess, featureTemplate);
  router.use("/modules", adminAccess, modules);
  router.use("/business-groups", adminAccess, businessGroup);
  router.use("/companies", adminAccess, companyRoutes);
  router.use("/branches", companyAccess, branchRoutes);
  router.use("/profile", companyAccess, profileRoutes);
  router.use("/vehicles", companyAccess, vehicleRoutes);
  router.use("/users", companyAccess, userRoutes);
  router.use("/drivers", companyAccess, driverRoutes);
  router.use("/trips", companyAccess, tripRoutes);
  router.use("/technician-tasks",companyAccess,technicianTaskRoutes);
  router.use("/file-upload", fileRoutes)
  router.use("/alerts", companyAccess, alertRoutes);
  router.use("/technicians",companyAccess , technicianRoutes)
  router.use('/geofences', companyAccess , geoFenceRoutes)
  router.use("/expenses",companyAccess , expenseRoutes)
  router.use("/dashboard", companyAccess, dashboardRoutes)


  await initTeltonikaServer();
  await initJT701Server();
  await initCronJob();

  // error handler
  app.use(errorHandler);
  http.createServer(app).listen(port);
  console.log(`Server is running at http://localhost:${port}`);
};

void initApp();
