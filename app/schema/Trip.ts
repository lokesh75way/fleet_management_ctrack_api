import mongoose, { Schema, Types } from 'mongoose';
import { BaseSchema } from '.';
import { IDriver } from './Driver';
import { IUser } from './User';
import { IVehicle } from './Vehicle';
import { IBusinessGroup } from './BusinessGroup';
import { ICompany } from './Company';


export enum TripStatus {
    ONGOING = 'ONGOING',
    COMPLETED = 'COMPLETED',
    PLANNED = 'PLANNED'
}

interface ITrip extends BaseSchema {
    businessUser: Types.ObjectId | IBusinessGroup;
    companyId: Types.ObjectId | ICompany;
    branchIds: Types.ObjectId[] | ICompany[];
    driverId: Types.ObjectId | IDriver;
    vehicleId: Types.ObjectId | IVehicle;
    tripStatus: TripStatus;
    startLocation: string;
    reachLocation: string;
    distance: number;
    fuelConsumption: number;
    lastModifiedBy: Types.ObjectId | IUser;
    createdBy: Types.ObjectId | IUser;
    isDeleted : Boolean;
    lastModifiedAt: Date;
    reachTime: Date;
    startTime: Date;
}

const TripSchema = new Schema<ITrip>(
    {
        businessUser: { type: Schema.Types.ObjectId, ref: 'business-group', required: true},
        companyId: { type: Schema.Types.ObjectId, ref: 'company', required: true},
        branchIds: { type: [Schema.Types.ObjectId], ref: 'company-branch'},
        driverId: { type: Schema.Types.ObjectId, ref: 'driver', required: true },
        vehicleId: { type: Schema.Types.ObjectId, ref: 'vehicle', required: true },
        tripStatus: { type: String, enum: Object.values(TripStatus) },
        startLocation: { type: String, required: true },
        reachLocation: { type: String, required: true },
        distance: { type: Number },
        fuelConsumption: { type: Number},
        reachTime: { type: Date, required: true },
        startTime: { type: Date, required: true },
        isDeleted : {type : Boolean , default : false},
        lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'user' },
        createdBy: { type: Schema.Types.ObjectId, ref: 'user' },
    },
    { timestamps: true }
);

export default mongoose.model<ITrip>('trip', TripSchema);
