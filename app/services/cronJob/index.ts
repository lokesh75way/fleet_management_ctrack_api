import cron from 'node-cron';
import {UnassignedVehicleData, trackingData } from './cronJob';
import { cleanupUnassignedVehicles, deleteOldTrackingData } from './cleanUp';

export const initCronJob = async()=>{
  cron.schedule('*/3 * * * *', async() => {
    // console.log("Cron job running")
    await trackingData();
  });

  // At 12 AM Everyday
  cron.schedule('0 0 * * *', async() => {
    // console.log("Cron job for get unassigned vehicle")
    await UnassignedVehicleData();
  });

  // At 1 AM every day - Clean up old tracking data (keep only today's data)
  cron.schedule('0 1 * * *', async () => {
    try {
      
      await deleteOldTrackingData();
      
      await cleanupUnassignedVehicles();
      
    } catch (error) {
      console.error('Error in cleanup cron:', error);
    }
  });
}