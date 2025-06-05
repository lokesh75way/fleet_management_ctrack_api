import TrakingHistory from '../../schema/TrakingHistory';
import UnassignedVehicle from '../../schema/UnassignedVehicle';

// Function to delete old tracking data (keep only last 24 hours)
export const deleteOldTrackingData = async () => {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    await TrakingHistory.deleteMany({
      createdAt: { $lte: twentyFourHoursAgo }
    });
    
  } catch (error) {
    console.error('Error deleting old tracking data:', error);
    throw error;
  }
};

// Function to clean up unassigned vehicles (remove duplicates, keep latest)
export const cleanupUnassignedVehicles = async () => {
  try {
    const uniqueImeis = await UnassignedVehicle.distinct('imeiNumber');
    
    let totalDeleted = 0;
    
    // For each IMEI, keep only the latest record
    for (const imei of uniqueImeis) {
      const latestRecord = await UnassignedVehicle
        .findOne({ imeiNumber: imei })
        .sort({ createdAt: -1 });
      
      if (latestRecord) {
        const deleteResult = await UnassignedVehicle.deleteMany({
          imeiNumber: imei,
          _id: { $ne: latestRecord._id }
        });
        
        totalDeleted += deleteResult.deletedCount;
      }
    }
    
    return totalDeleted;
  } catch (error) {
    console.error('Error cleaning up unassigned vehicles:', error);
    throw error;
  }
};
