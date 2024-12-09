import mongoose, { Schema, Types } from 'mongoose';
import { BaseSchema } from '.';
import { IDriver } from './Driver';
import { IUser } from './User';
import { IVehicle } from './Vehicle';


export enum TripStatus {
    ONGOING = 'ONGOING',
    COMPLETED = 'COMPLETED',
    JUST_STARTED = 'JUST_STARTED'
}

interface ITrip extends BaseSchema {
    driver: Types.ObjectId | IDriver;
    vehicle: Types.ObjectId | IVehicle;
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
        driver: { type: Schema.Types.ObjectId, ref: 'driver', required: true },
        vehicle: { type: Schema.Types.ObjectId, ref: 'vehicle' },
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
