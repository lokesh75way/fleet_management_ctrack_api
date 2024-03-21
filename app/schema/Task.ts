import mongoose, { Schema, Types } from 'mongoose';
import { BaseSchema } from '.';
import { ITechnician } from './Technician';

// Define enums
enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

enum TaskCategory {
  INSTALLATION = 'INSTALLATION',
  MAINTAINANCE = 'MAINTAINANCE'
}

interface ITask extends BaseSchema {
  technicianId: Types.ObjectId | ITechnician;
  taskCategory: TaskCategory;
  taskName: string;
  taskPriority: TaskPriority;
  contactPersonName: string;
  contactPersonNumber: string;
  serviceLocation: string;
  plannedReportingDate: string;
  reportingTime: string;
  description: string;
  createdBy: Types.ObjectId;
}

const TaskSchema = new Schema<ITask>(
  {
    technicianId: { type: Schema.Types.ObjectId, ref : 'technician' , required: true },
    taskCategory: { type: String, required: true },
    taskName: { type: String, required: true },
    taskPriority: { type: String, enum: Object.values(TaskPriority), required: true },
    description: { type: String },
    contactPersonName: { type: String },
    contactPersonNumber: { type: String },
    serviceLocation: { type: String },
    plannedReportingDate: { type: String },
    reportingTime: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref : 'user' },
  },
  { timestamps: true }
);

export default mongoose.model<ITask>('Task', TaskSchema);
