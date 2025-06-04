import { executeQuery, getClient } from "../../helper/db";
import { PoolClient } from "pg";
import { encrypt } from "../../helper/encrypt";
import axios from "axios";
import logger from "../../helper/logger";

export class BatchRepository {
  public async parcelTrackingStatusUpdate(): Promise<any> {
    const client: PoolClient = await getClient();
    try {
      const cnnoResults = await client.query(
        `SELECT dsr_cnno FROM "bulkParcelDataMapping" LIMIT 10;`
      );

      for (const row of cnnoResults.rows) {
        const cnno = row.dsr_cnno;
        console.log("cnno", cnno);

        if (!cnno) continue; // skip if empty

        try {
          const response = await axios.post(
            "https://blktracksvc.dtdc.com/dtdc-api/rest/JSONCnTrk/getTrackDetails",
            {
              trkType: "cnno",
              strcnno: cnno,
              addtnlDtl: "Y",
            },
            {
              headers: {
                "Content-Type": "application/json",
                "x-access-token":
                  "EO1727_trk_json:47906b6b936de5d0500c3b9606edfeb4",
              },
            }
          );

          const data = response.data;
          console.log("data", data);

          if (data?.statusCode === 200 && data?.statusFlag) {
            logger.info(`Tracking success for CNNO ${cnno}`, data);

            // Extract tempStatus and overallStatus from response
            console.log(
              "data.trackDetails?.[data.trackDetails.length - 1]",
              data.trackDetails?.[data.trackDetails.length - 1]
            );
            const lastDetail =
              data.trackDetails?.[data.trackDetails.length - 1];
            const tempStatus = lastDetail?.strCode || "Fetched";

            console.log("Last strCode:", tempStatus);

            const overallStatus = data.trackDetails || "Fetched";
            console.log("data.trackHeader?.[0]?.strAction", data.trackHeader);

            // Update the bulkParcelDataMapping table
            await client.query(
              `UPDATE "bulkParcelDataMapping"
               SET "tempStatus" = $1,
                   "overallStatus" = $2,
                   "mod_date" = TO_CHAR(NOW(), 'YYYY-MM-DD'),
                   "mod_time" = TO_CHAR(NOW(), 'HH24:MI:SS')
               WHERE dsr_cnno = $3`,
              [tempStatus, overallStatus, cnno]
            );
          } else {
            logger.warn(`Tracking failed for CNNO ${cnno}:`, data);
          }
        } catch (apiError) {
          logger.error(
            `API error for CNNO ${cnno}:`,
            (apiError as Error).message
          );
        }
      }

      return encrypt(
        {
          success: true,
          message: "Parcel tracking update completed",
        },
        true
      );
    } catch (error: unknown) {
      await client.query("ROLLBACK");
      return encrypt(
        {
          success: false,
          message: "Failed to update parcel tracking status",
          error: (error as Error).message,
        },
        true
      );
    } finally {
      client.release();
    }
  }
}
