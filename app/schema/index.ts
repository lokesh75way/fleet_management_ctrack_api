import { type Types } from "mongoose";

export interface BaseSchema {
  _id: Types.ObjectId;
  createdAt: string;
  updatedAt: string;
}
