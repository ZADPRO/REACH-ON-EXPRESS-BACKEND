import { executeQuery, getClient } from "../../helper/db";
import { PoolClient } from "pg";
// import { storeFile, viewFile, deleteFile } from "../helper/storage";
import path from "path";
import { encrypt } from "../../helper/encrypt";
import { CurrentTime, generatePassword } from "../../helper/common";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateTokenWithExpire } from "../../helper/token";
import { FetchAllReportData, updateHistoryQuery } from "./query";
import axios from "axios";

export class FinanceRepository {
  public async viewFinanceReportV1(
    userData: any,
    token_data: any
  ): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: token_data.id }; // Extract token ID
    const tokens = generateTokenWithExpire(token, true);

    const query = `
      SELECT 
        MIN(id) AS id,  -- get one primary key from the group
        "refCustomerName" AS name,
        SUM(COALESCE(netamount, 0) + COALESCE(pickup, 0)) AS outstanding,
        vpb.paymentid
      FROM 
        public."VendorParcelBooking" vpb
      WHERE 
        "parcelStatus" = 'success'
      GROUP BY 
        paymentid, "refCustomerName";
    `;

    const result = await client.query(query);

    return encrypt(
      {
        success: true,
        message: "Finance data fetched successfully",
        token: tokens,
        result: result.rows,
      },
      true
    );
  }

  public async updateFinanceReport(
    userData: { refCustomerName: string; payAmount: number; paymentid: number },
    token_data: any
  ): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: token_data.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
      await client.query("BEGIN");

      // Step 1: Fetch unpaid parcels for the customer
      const res = await client.query(
        `SELECT id, netamount, pickup 
       FROM "VendorParcelBooking" 
       WHERE "refCustomerName" = $1 
         AND "parcelStatus" = 'success'
         AND ("paymentid" IS NULL OR "paymentid" = 3)
       ORDER BY "createdat" DESC`,
        [userData.refCustomerName]
      );

      let remainingAmount = userData.payAmount;
      console.log("remainingAmount", remainingAmount);

      for (const row of res.rows) {
        console.log("row", row);
        const rowTotal = Number(row.netamount || 0) + Number(row.pickup || 0);
        console.log("rowTotal", rowTotal);

        if (remainingAmount <= 0) break;

        if (remainingAmount >= rowTotal) {
          // Fully pay this record
          await client.query(
            `UPDATE "VendorParcelBooking"
           SET "paymentid" = $1
           WHERE id = $2`,
            [userData.paymentid, row.id]
          );
          remainingAmount -= rowTotal;
          console.log("remainingAmount", remainingAmount);
        } else {
          // Partially pay (optional logic - keep as unpaid or flag differently)
          break;
        }
      }

      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message: "Payment successfully updated in finance records",
          token: tokens,
        },
        true
      );
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error updating finance:", err);
      return encrypt(
        { success: false, message: "Error updating finance" },
        true
      );
    } finally {
      client.release();
    }
  }

  public async viewFullReportV1(userData: any, token_data: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: token_data.id }; // Extract token ID
    const tokens = generateTokenWithExpire(token, true);

    try {
      await client.query("BEGIN");

      // Fetch vendor details
      const queryResult = await client.query(FetchAllReportData);

      if (!queryResult.rows.length) {
        // Check if rows array is empty
        await client.query("ROLLBACK");
        return encrypt(
          {
            success: false,
            message: "No data found for the given userData",
            token: tokens,
          },
          true
        );
      }

      const vendorDetails = queryResult.rows;

      // Insert transaction history
      const txnHistoryParams = [
        30, // TransTypeID
        token_data.id, // refUserId (Modify as needed)
        "Fetch Report Data",
        CurrentTime(), // TransTime
        "admin", // UpdatedBy (Modify based on logged-in user)
      ];
      await client.query(updateHistoryQuery, txnHistoryParams);

      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          data: vendorDetails,
          token: tokens,
        },
        true
      );
    } catch (error: unknown) {
      await client.query("ROLLBACK");

      let errorMessage = "An unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error("Error fetching vendor details:", error);

      return encrypt(
        {
          success: false,
          message: "Failed to fetch report data",
          error: errorMessage,
          token: tokens,
        },
        true
      );
    } finally {
      client.release();
    }

    return encrypt(
      {
        success: true,
        message: "Finance data fetched successfully",
        token: tokens,
      },
      true
    );
  }

  public async viewTrackingV1(userData: any, token_data: any): Promise<any> {
    console.log("userData", userData);
    const client: PoolClient = await getClient();
    const token = { id: token_data.id }; // Extract token ID
    const tokens = generateTokenWithExpire(token, true);

    try {
      if (userData.vendorType === "DTDC") {
        const response = await axios.post(
          "https://blktracksvc.dtdc.com/dtdc-api/rest/JSONCnTrk/getTrackDetails",
          {
            trkType: "cnno",
            strcnno: userData.strcnno,
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

        console.log("response", response);
        if (response.data?.statusCode === 200 && response.data?.statusFlag) {
          return encrypt(
            {
              success: true,
              message: "DTDC tracking fetched successfully",
              data: response.data,
              token: tokens,
            },
            true
          );
        } else {
          return encrypt(
            {
              success: false,
              message: "DTDC tracking failed or number not found",
              token: tokens,
            },
            true
          );
        }
      } else if (userData.vendorType === "Delhivery") {
        const url = `https://track.delhivery.com/api/v1/packages/json?waybill=${userData.strcnno}&token=f4881f7518b05af9e0e3446b8b697c490dbef74f`;
        console.log("url", url);

        const response = await axios.get(url);
        console.log("response", response.data.ShipmentData);

        if (
          response.data &&
          response.data.ShipmentData &&
          response.data.ShipmentData.length > 0
        ) {
          return encrypt(
            {
              success: true,
              message: "Delhivery tracking fetched successfully",
              data: response.data,
              token: tokens,
            },
            true
          );
        } else {
          return encrypt(
            {
              success: false,
              message: "Delhivery tracking failed or number not found",
              token: tokens,
            },
            true
          );
        }
      } else {
        return encrypt(
          {
            success: false,
            message: "Something went wrong. Unsupported vendor.",
            token: tokens,
          },
          true
        );
      }
    } catch (error) {
      console.error("Tracking API error:", error || error);
      return encrypt(
        {
          success: false,
          message: "An error occurred while fetching tracking details",
          error: error || error,
          token: tokens,
        },
        true
      );
    }
  }

  public async viewDashboardData(userData: any, token_data: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: token_data.id }; // Extract token ID
    const tokens = generateTokenWithExpire(token, true);

    const query = `
      WITH ist_today AS (
        SELECT 
          (createdat::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::date AS ist_date,
          netamount,
          "parcelStatus"
        FROM 
          public."VendorParcelBooking"
        )
        SELECT
          COUNT(*) AS total_orders_today,
          SUM(netamount) AS total_revenue_today
        FROM
          ist_today
        WHERE
          ist_date = CURRENT_DATE -- today's date in IST timezone
          AND "parcelStatus" = 'success';
    `;

    const result = await client.query(query);

    return encrypt(
      {
        success: true,
        message: "Finance data fetched successfully",
        token: tokens,
        result: result.rows,
      },
      true
    );
  }
}
