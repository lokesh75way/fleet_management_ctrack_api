import mongoose, { Schema, Types } from "mongoose";
import { type BaseSchema } from "./index";
import { IBusinessGroup } from "./BusinessGroup";
import { ICompany } from "./Company";
import { IBranch } from "./CompanyBranch";

export enum DistanceCounter {
  GPS = "GPS",
  OBD = "OBD",
  RELATIVEODOMETER = "RELATIVEODOMETER",
  TACHOGRAPH = "TACHOGRAPH",
}

export enum UnitOFDistance {
  KILOMETER = "KILOMETER",
  MILE = "MILE",
  NATURAL_MILE = "NATURAL_MILE",
}

export enum VehicleCategory {
  MOVABLE = "MOVABLE",
  IMMOVABLE = "IMMOVABLE",
}

export enum Permit {
  ITC = "ITC",
  NORMAL = "NORMAL",
  RENT = "RENT",
  FULL_SENSOR = "FULL_SENSOR",
  MEDICAL = "MEDICAL",
  OTHER = "OTHER",
}

export enum FuelType {
  PETROL = "PETROL",
  DISEAL = "DISEAL",
  GAS = "GAS",
  ELECTRIC = "ELECTRIC",
}

export enum CostType {
  DISTANCE = "DISTANCE",
  DURATION = "DURATION",
}

export enum FuelSensor {
  SINGLE = "SINGLE",
  MULTIPLE = "MULTIPLE",
}

export enum ReadingType {
  DIRECT = "DIRECT",
  INVERSE = "INVERSE",
}

export enum SpeedDetection {
  DEVICE = "DEVICE",
  LATING = "LATING",
}

export enum DocumentType {
  INSURANCE = "INSURANCE",
  PSU = "PSU",
  REGISTRARION_CERTIFICATE = "REGISTRARION_CERTIFICATE",
  SERVICE_CONTRACT = "SERVICE_CONTRACT",
  NATIONAL_PERMIT = "NATIONAL_PERMIT",
  STATE_PERMIT = "STATE_PERMIT",
  RTO_PASSING = "RTO_PASSING",
  ROAD_TAX = "ROAD_TAX",
}

export interface IVehicle extends BaseSchema {
  businessGroupId: Types.ObjectId | IBusinessGroup;
  companyId: Types.ObjectId | ICompany;
  branchId: Types.ObjectId | IBranch;
  vehicleName: string;
  deviceType: string;
  // deviceId: mongoose.Types.ObjectId;
  imeiNumber: string;
  copyFrom: string;
  serverAddress: string;
  simNumber: string;
  secondrySimNumber: string;
  distanceCounter: DistanceCounter;
  unitOfDistance: UnitOFDistance;
  speedDetection: SpeedDetection;
  deviceAccuracyTolerance: string;
  // profile
  plateNumber: string;
  vehicleCategory: VehicleCategory;
  dvirTemplate: string;
  purchaseAmount: number;
  manufacturerDate: Date;
  purchaseDate: Date;
  weightCapacity: number;
  gpsInstallationDate: Date;
  gpsWarranty: number;
  companyAverage: string;
  permit: Permit;
  installationDate: Date;
  registrationNumber: string;
  fuelType: FuelType;
  distanceBaseFuelConsumption: number;
  durationBaseFuelConsumption: number;
  fuelIdlingConsumption: string;
  consumptionTolerancePercent: number;
  vinNumber: number;
  engineNumber: string;
  odometer: string;
  lsbDetectionRadius: string;
  engineHour: string;
  passengerSeat: number;
  costType: CostType;
  distance: number;
  duration: number;
  rfidTimeoutDuration: number;
  sleepModeDuration: number;
  minimumWorkingHour: number;
  weightSensor: boolean;
  underweightTolerance: number;
  overweightTolerance: number;
  loadingUnloadingTolerance: number;
  fuelSensor: FuelSensor;
  gSensor: boolean;
  documents: {
    documentType: DocumentType;
    file: string;
    issueDate: Date;
    expireDate: Date;
  }[];

  isActive : boolean;
  isDeleted : boolean;
}

const Vehicle = new Schema<IVehicle>(
  {
    businessGroupId: {
      type: Schema.Types.ObjectId,
      ref: "business-group",
      required: true,
    },
    companyId: { type: Schema.Types.ObjectId, ref: "company", required: true },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: "company-branch",
      required: true,
    },
    vehicleName: { type: String, required: true },
    deviceType: { type: String },
    // deviceId: { type: Schema.Types.ObjectId, ref: "Device", required: true },
    imeiNumber: { type: String, required: true },
    copyFrom: { type: String },
    serverAddress: { type: String },
    simNumber: { type: String },
    secondrySimNumber: { type: String },
    distanceCounter: { type: String, enum: Object.values(DistanceCounter) },
    unitOfDistance: { type: String, enum: Object.values(UnitOFDistance) },
    speedDetection: { type: String },
    deviceAccuracyTolerance: { type: String },
    // profile
    plateNumber: { type: String },
    vehicleCategory: { type: String, enum: Object.values(VehicleCategory) },
    dvirTemplate: { type: String },
    manufacturerDate: { type: Date },
    purchaseDate: { type: Date },
    purchaseAmount: { type: Number },
    weightCapacity: { type: Number },
    gpsInstallationDate: { type: Date },
    gpsWarranty: { type: Number },
    companyAverage: { type: String },
    permit: { type: String, enum: Object.values(Permit) },
    installationDate: { type: Date },
    registrationNumber: { type: String },
    fuelType: { type: String, enum: Object.values(FuelType) },
    distanceBaseFuelConsumption: { type: Number },
    durationBaseFuelConsumption: { type: Number },
    fuelIdlingConsumption: { type: String },
    consumptionTolerancePercent: { type: Number },
    vinNumber: { type: Number },
    engineNumber: { type: String },
    odometer: { type: String },
    lsbDetectionRadius: { type: String },
    engineHour: { type: String },
    passengerSeat: { type: Number },
    costType: { type: String, enum: Object.values(CostType) },
    distance: { type: Number },
    duration: { type: Number },
    rfidTimeoutDuration: { type: Number },
    sleepModeDuration: { type: Number },
    minimumWorkingHour: { type: Number },
    weightSensor: { type: Boolean },
    underweightTolerance: { type: Number },
    overweightTolerance: { type: Number },
    loadingUnloadingTolerance: { type: Number },
    fuelSensor: { type: String, enum: Object.values(FuelSensor) },
    gSensor: { type: Boolean },
    documents: [
      {
        documentType: { type: String, enum: Object.values(DocumentType) },
        file: { type: String },
        issueDate: { type: Date },
        expireDate: { type: Date },
      },
    ],

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IVehicle>("vehicle", Vehicle);
