import { Model, Schema, model } from "mongoose";

export enum GEOFENCE_TYPE {
  Point = "Point",
  Line = "Line",
  Polygon = "Polygon",
  Circle = "Circle",
}


export interface GeoFenceLocationBase extends Document {
  type: GEOFENCE_TYPE;
  coordinates: any;
  duration?: number
}

type GeoFenceLocationModel = Model<GeoFenceLocationBase>;

const GeoFenceLocationSchema = new Schema<GeoFenceLocationBase>(
  {
    type: { type: String , enum : Object.values(GEOFENCE_TYPE), required: true },
    coordinates: { type: Schema.Types.Mixed, required: true },
  },
  { discriminatorKey: "type" }
);

const GeoFenceLocation = model<GeoFenceLocationBase, GeoFenceLocationModel>(
  "GeoFenceLocation",
  GeoFenceLocationSchema
);

const PointSchema = new Schema<GeoFenceLocationBase>({
  coordinates: { type: [Number], required: true },
});

const LineStringSchema = new Schema<GeoFenceLocationBase>({
  coordinates: { type: [[Number]], required: true },
});

const PolygonSchema = new Schema<GeoFenceLocationBase>({
  coordinates: { type: [[[Number]]], required: true },
});

const CircleSchema = new Schema<GeoFenceLocationBase>({
  coordinates: { type: [Number], required: true },
  duration: { type: Number, required: true}
});


GeoFenceLocation.discriminator(GEOFENCE_TYPE.Point, PointSchema);
GeoFenceLocation.discriminator(GEOFENCE_TYPE.Line, LineStringSchema);
GeoFenceLocation.discriminator(GEOFENCE_TYPE.Polygon, PolygonSchema);
GeoFenceLocation.discriminator(GEOFENCE_TYPE.Circle, CircleSchema);

export default GeoFenceLocation;
