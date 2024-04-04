import mongoose, { Schema, Types } from 'mongoose';
import { BaseSchema } from '.';
import { IDriver } from './Driver';
import { IUser } from './User';


export enum TripStatus {
    ONGOING = 'ONGOING',
    COMPLETED = 'COMPLETED',
    JUST_STARTED = 'JUST_STARTED'
}

interface ITrip extends BaseSchema {
    driverId: Types.ObjectId | IDriver;
    tripStatus: TripStatus;
    startLocation: string;
    reachLocation: string;
    distance: number;
    fuelConsumption: number;
    lastModifiedBy: Types.ObjectId | IUser;
    createdBy: Types.ObjectId | IUser;
    lastModifiedAt: Date;
    reachTime: Date;
    startTime: Date;
}

const TripSchema = new Schema<ITrip>(
    {
        driverId: { type: Schema.Types.ObjectId, ref: 'driver', required: true },
        tripStatus: { type: String, enum: Object.values(TripStatus), required: true },
        startLocation: { type: String, required: true },
        reachLocation: { type: String, required: true },
        distance: { type: Number, required: true },
        fuelConsumption: { type: Number, required: true },
        reachTime: { type: Date, required: true },
        startTime: { type: Date, required: true },
        lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'user' },
        createdBy: { type: Schema.Types.ObjectId, ref: 'user' },
    },
    { timestamps: true }
);

export default mongoose.model<ITrip>('trip', TripSchema);
