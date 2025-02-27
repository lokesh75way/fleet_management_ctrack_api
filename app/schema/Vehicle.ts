import mongoose, { Schema, Types } from "mongoose";
import { type BaseSchema } from "./index";
import { IBusinessGroup } from "./BusinessGroup";
import { ICompany } from "./Company";
import { IBranch } from "./CompanyBranch";

export enum DistanceCounter {
  GPS = "GPS",
  OBD = "OBD",
  RELATIVE_ODOMETER = "RELATIVEODOMETER",
  TACHOGRAPH = "TACHOGRAPH",
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
  DIESEAL = "DIESEL",
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

export enum DurationUnit {
  DAY = "Day",
  HOUR = "Hour",
}

export enum FuelUnit {
  LITRE = "LITERS",
  GALLON = "GALLONS",
}

export enum DurationBasedUnit {
  HHMM = "HH:MM",
  MM = "MM",
}

export interface Reminder {
  lastRenewalDate: string;
  period: string;
  nextRenewalDate: string;
  reminderStarts: string;
}

export interface IVehicle extends BaseSchema {
  businessGroupId: Types.ObjectId | IBusinessGroup;
  companyId: Types.ObjectId | ICompany;
  branchId: Types.ObjectId | IBranch;
  vehicleName: string;
  deviceType: string;
  deviceId: mongoose.Types.ObjectId;
  imeiNumber: string;
  copyFrom: string;
  serverAddress: string;
  simNumber: string;
  secondrySimNumber: string;
  distanceCounter: DistanceCounter;
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
  fuelIdlingConsumption: string;
  consumptionTolerancePercent: number;
  vinNumber: number;
  engineNumber: string;
  odometer: string;
  lsbDetectionRadius: string;
  engineHour: string;
  passengerSeat: number;
  costType: CostType;
  distanceCostQuantity: number;
  durationCostQuantity: number;
  rfidTimeoutDuration: number;
  sleepModeDuration: number;
  minimumWorkingHour: number;
  weightSensor: boolean;
  underweightTolerance: number;
  overweightTolerance: number;
  loadingUnloadingTolerance: number;
  fuelSensor: FuelSensor;
  gSensor: boolean;
  distanceBasedDistanceQuantity: number;
  distanceBaseFuelConsumption: number;
  distanceBaseFuelConsumptionUnit: FuelUnit;
  durationBaseFuelConsumptionDurationQuanitty: number;
  durationBaseFuelConsumptionDurationUnit: DurationBasedUnit;
  durationBaseDistanceQuantity: number;
  durationBaseFuelConsumptionUnit: FuelUnit;
  LBSDetectionRadius: number;
  noOfTanks: number;
  axisX: number;
  axisY: number;
  axisZ: number;
  durationUnit: DurationUnit;
  fuelIdlingConsumptionUnit: FuelUnit;
  documents: {
    documentType: DocumentType;
    file: string;
    issueDate: Date;
    expireDate: Date;
  }[];

  isActive: boolean;
  isDeleted: boolean;
  vehicleNumber: string;
  unitId: string;
  fleetNumber?: string;
  description: string;
  manufacture: string;
  year: number;
  model: string;
  color: string;
  vinChassisNumber: number;
  group: string;
  groupDescription: string;
  tollCategory: string;
  tarrifType: string;
  licenseNumber: string;
  licenseExpire: string;
  roadWorthy: string;
  roadWorthyExpire: string;
  odo: string;
  odoNextService: string;
  hours: string;
  hoursNextService: string;
  currentStatus: string;
  speed: string;
  currentDriver: string;
  heading: string;
  currentLocation: string;
  skillSet: string;
  profile: string;
  owningCostCenter: string;
  licenseReminder: Reminder;
  roadWorthyReminder: Reminder;
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
      type: mongoose.Types.ObjectId,
      ref: "company-branch",
    },
    vehicleName: { type: String, required: true },
    deviceType: { type: String, required: true },
    // deviceId: { type: Schema.Types.ObjectId, ref: "Device", required: true },
    imeiNumber: { type: String, required: true, unique: true },
    copyFrom: { type: String },
    serverAddress: { type: String },
    simNumber: { type: String, required: true },
    secondrySimNumber: { type: String },
    distanceCounter: { type: String, enum: Object.values(DistanceCounter) },
    speedDetection: { type: String },
    deviceAccuracyTolerance: { type: String, required: true },
    // profile
    plateNumber: { type: String },
    // plateNumber: {type: String, unique: true},
    vehicleCategory: { type: String, enum: Object.values(VehicleCategory) },
    dvirTemplate: { type: String },
    manufacturerDate: { type: Date },
    purchaseDate: { type: Date },
    purchaseAmount: { type: Number },
    weightCapacity: { type: Number },
    gpsInstallationDate: { type: Date },
    gpsWarranty: { type: Number },
    companyAverage: { type: String },
    permit: { type: String, enum: Object.values(Permit), required: true },
    installationDate: { type: Date },
    registrationNumber: { type: String },
    fuelType: { type: String, enum: Object.values(FuelType) },
    fuelIdlingConsumption: { type: String },
    consumptionTolerancePercent: { type: Number },
    vinNumber: { type: Number },
    engineNumber: { type: String },
    odometer: { type: String },
    lsbDetectionRadius: { type: String },
    engineHour: { type: String },
    passengerSeat: { type: Number },
    costType: { type: String, enum: Object.values(CostType) },
    distanceCostQuantity: { type: Number },
    durationCostQuantity: { type: Number },
    rfidTimeoutDuration: { type: Number },
    sleepModeDuration: { type: Number },
    minimumWorkingHour: { type: Number },
    weightSensor: { type: Boolean },
    underweightTolerance: { type: Number },
    overweightTolerance: { type: Number },
    loadingUnloadingTolerance: { type: Number },
    fuelSensor: { type: String, enum: Object.values(FuelSensor) },
    gSensor: { type: Boolean },
    noOfTanks: { type: Number },
    LBSDetectionRadius: { type: Number },
    durationUnit: { type: String, enum: Object.values(DurationUnit) },
    axisX: { type: Number },
    axisY: { type: Number },
    axisZ: { type: Number },
    fuelIdlingConsumptionUnit: { type: String, enum: Object.values(FuelUnit) },
    distanceBasedDistanceQuantity: { type: Number },
    distanceBaseFuelConsumption: { type: Number },
    distanceBaseFuelConsumptionUnit: {
      type: String,
      enum: Object.values(FuelUnit),
    },
    durationBaseFuelConsumptionDurationQuanitty: { type: Number },
    durationBaseFuelConsumptionDurationUnit: {
      type: String,
      enum: Object.values(DurationBasedUnit),
    },
    durationBaseDistanceQuantity: { type: Number },
    durationBaseFuelConsumptionUnit: {
      type: String,
      enum: Object.values(FuelUnit),
    },
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
    vehicleNumber: { type: String },
    unitId: { type: String },
    fleetNumber: { type: String },
    description: { type: String },
    manufacture: { type: String },
    year: { type: Number },
    model: { type: String },
    color: { type: String },
    vinChassisNumber: { type: Number },
    group: { type: String },
    groupDescription: { type: String },
    tollCategory: { type: String },
    tarrifType: { type: String },
    licenseNumber: { type: String },
    licenseExpire: { type: String },
    roadWorthy: { type: String },
    roadWorthyExpire: { type: String },
    odo: { type: String },
    odoNextService: { type: String },
    hours: { type: String },
    hoursNextService: { type: String },
    currentStatus: { type: String },
    speed: { type: String },
    currentDriver: { type: String },
    heading: { type: String },
    currentLocation: { type: String },
    skillSet: { type: String },
    profile: { type: String },
    owningCostCenter: { type: String },
    licenseReminder: {
      lastRenewalDate: { type: String },
      period: { type: String },
      nextRenewalDate: { type: String },
      reminderStarts: { type: String },
    },
    roadWorthyReminder: {
      lastRenewalDate: { type: String },
      period: { type: String },
      nextRenewalDate: { type: String },
      reminderStarts: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IVehicle>("vehicle", Vehicle);
