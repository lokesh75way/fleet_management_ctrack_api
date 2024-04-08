import cron from 'node-cron';
import {trackingData } from './cronJob';

export const initCronJob = async()=>{
  cron.schedule('*/2 * * * *', async() => {
    console.log("Cron job running")
    await trackingData();
  });
}