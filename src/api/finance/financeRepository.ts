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

export class FinanceRepository {
  public async viewFinanceReportV1(
    userData: any,
    token_data: any
  ): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: token_data.id }; // Extract token ID
    const tokens = generateTokenWithExpire(token, true);

    return encrypt(
      {
        success: true,
        message: "Finance data fetched successfully",
        token: tokens,
      },
      true
    );
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
}
