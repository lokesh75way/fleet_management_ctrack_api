import axios, { AxiosResponse, AxiosError } from 'axios';
import TrakingHistory,{ ITrakingHistory } from '../../schema/TrakingHistory';
import Vehicle from '../../schema/Vehicle';
import { AnyBulkWriteOperation } from 'mongodb';
import UnassignedVehicle from '../../schema/UnassignedVehicle';
const TRACKING_URL:string = "http://157.175.107.239/webservice?token=getLiveData&user=API@aitracking.com&pass=Api@2024&company=NFPC&format=json";


const getTrackingData = async()=>{
  try {
    let response = await axios.get<any>(TRACKING_URL);
    return response;
  } catch (error:any) {
    console.log(error);
    throw new Error(error?.message);
  }
}

export const trackingData = async()=>{
  try {
    let response = await getTrackingData();
    if(response?.data?.root?.error){
      console.log("Limit Exceed call api after 120 seconds time interval");
      console.log(response)
    }else if(response?.data?.root?.VehicleData){
      let vehiclesImeiNumbers = response?.data?.root?.VehicleData?.map((e:any)=> e.Imeino);
      let vehiclesData = await Vehicle.find({imeiNumber : {$in : vehiclesImeiNumbers }, isDeleted: false});      let trackingData = await Promise.all(response?.data?.root?.VehicleData?.map(async(vehicle:any)=>{
        let vehicleData = vehiclesData.find((e:any)=> e.imeiNumber == vehicle.Imeino);
        if(vehicleData){
          vehicle.vehicleId = vehicleData._id;
        }
        vehicle.imeiNumber = vehicle.Imeino;
        return vehicle;
      }));
      const bulkOps: AnyBulkWriteOperation<any>[] = trackingData.map(doc => ({
        updateMany: {
          filter: { Datetime: doc.Datetime,imeiNumber : doc.imeiNumber,Vehicle_No : doc.Vehicle_No , vehicleId : doc.vehicleId },
          update: { $set: doc },
          upsert: true,
        },
      }));
      await TrakingHistory.bulkWrite(bulkOps);
    }
  } catch (error:any) {
    console.log("Got error while trying to retrieve data from server")
    console.log(error);
  }
}

export const UnassignedVehicleData = async()=>{
  try {
    let response = await getTrackingData();
    if(response?.data?.root?.error){
      console.log("Limit Exceed call api after 120 seconds time interval");
    }else if(response?.data?.root?.VehicleData){
      let trackingData = await Promise.all(response?.data?.root?.VehicleData?.map(async(vehicle:any)=>{
        vehicle.imeiNumber = vehicle.Imeino;
        return vehicle;
      }));
      // For Unassined Vehicle
      const unassinedBulkOps: AnyBulkWriteOperation<any>[] = trackingData.map(vehicle => ({
        updateMany: {
          filter: { imeiNumber : vehicle.imeiNumber },
          update: { $set: vehicle },
          upsert: true,
        },
      }));
      await UnassignedVehicle.bulkWrite(unassinedBulkOps);
    }
  } catch (error:any) {
    console.log("Got error while trying to retrieve data from server")
    console.log(error);
  }
}