import cron from "node-cron";
import { BatchRepository } from "../api/batchRepo/batchRepo";
import { CurrentTime } from "../helper/common";

export const startCronJobs = () => {
  cron.schedule("0 * * * *", async () => {
    console.log("Running daily batch job at 9:00 AM", CurrentTime());

    try {
      const batchRepo1 = new BatchRepository();
      await batchRepo1.parcelTrackingStatusUpdate();
      console.log("Daily batch job completed successfully", CurrentTime());
    } catch (error) {
      console.error("Error in daily batch job:", error, CurrentTime());
    }
  });
};
