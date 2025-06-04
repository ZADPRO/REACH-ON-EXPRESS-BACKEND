import { executeQuery, getClient } from "../../helper/db";
import { PoolClient } from "pg";
import { encrypt } from "../../helper/encrypt";
import axios from "axios";
import logger from "../../helper/logger";

export class BatchRepository {
  public async parcelTrackingStatusUpdate(): Promise<any> {
    const client: PoolClient = await getClient();

    // Define multiple API credential sets
    const credentials = [
      {
        clientCode: "EO1727",
        apiKey: "5dd8e4d35166672758bd1ee8953025",
        serviceType: "B2C PRIORITY, B2C SMART EXPRESS",
        accessToken: "EO1727_trk_json:47906b6b936de5d0500c3b9606edfeb4",
      },
      {
        clientCode: "EO874",
        apiKey: "77ae943490cc759d06d6a38f6f5839",
        serviceType: "GROUND EXPRESS",
        accessToken: "EO874_trk_json:26c89a28c0ff8266e5b9d1382f70cabf",
      },
      {
        clientCode: "EO897",
        apiKey: "b15a6b72b31d939418405d0ee5d871",
        serviceType: "GROUND EXPRESS",
        accessToken: "EO897_trk_json:df387fd423a8010635ba982c8eed0a02",
      },
    ];

    try {
      // Get CNNOs where tempStatus is not 'DLV'
      const cnnoResults = await client.query(
        `
        SELECT bpd.dsr_cnno, bpd.id FROM "bulkParcelDataMapping" bpd WHERE "tempStatus" IS DISTINCT FROM 'DLV' ORDER BY bpd.id ASC;
        `
      );

      for (const row of cnnoResults.rows) {
        const cnno = row.dsr_cnno;
        console.log("Processing CNNO:", cnno);
        if (!cnno) continue;

        let success = false;

        for (const cred of credentials) {
          console.log("cred", cred.accessToken);
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
                  "x-access-token": cred.accessToken,
                },
              }
            );

            const data = response.data;

            if (data?.statusCode === 200 && data?.statusFlag) {
              const lastDetail =
                data.trackDetails?.[data.trackDetails.length - 1];
              const tempStatus = lastDetail?.strCode || "Fetched";
              const overallStatus = JSON.stringify(data.trackDetails || []);

              await client.query(
                `UPDATE "bulkParcelDataMapping"
                 SET "tempStatus" = $1,
                     "overallStatus" = $2
                 WHERE dsr_cnno = $3`,
                [tempStatus, overallStatus, cnno]
              );

              logger.info(
                `Tracking successful for CNNO ${cnno} using ${cred.clientCode}`
              );
              success = true;
              break; // exit credential loop
            } else {
              logger.warn(
                `Tracking failed for CNNO ${cnno} using ${cred.clientCode}`,
                data
              );
            }
          } catch (apiError) {
            logger.error(
              `API error for CNNO ${cnno} using ${cred.clientCode}:`,
              (apiError as Error).message
            );
          }
        }

        // If all credentials fail, update with null
        if (!success) {
          await client.query(
            `UPDATE "bulkParcelDataMapping"
             SET "tempStatus" = NULL,
                 "overallStatus" = NULL,
                 "mod_date" = TO_CHAR(NOW(), 'YYYY-MM-DD'),
                 "mod_time" = TO_CHAR(NOW(), 'HH24:MI:SS')
             WHERE dsr_cnno = $1`,
            [cnno]
          );
          logger.warn(
            `All credentials failed for CNNO ${cnno}. Marked as null.`
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
