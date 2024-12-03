import cron from 'node-cron';
import {UnassignedVehicleData, trackingData } from './cronJob';

export const initCronJob = async()=>{
  cron.schedule('*/3 * * * *', async() => {
    // console.log("Cron job running")
    // await trackingData();
  });

  // At 12 AM Everyday
  cron.schedule('0 0 * * *', async() => {
    // console.log("Cron job for get unassigned vehicle")
    // await UnassignedVehicleData();
  });
}