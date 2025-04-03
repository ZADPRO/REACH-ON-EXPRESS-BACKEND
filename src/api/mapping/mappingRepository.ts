import { executeQuery, getClient } from "../../helper/db";
import { PoolClient } from "pg";
import moment from "moment"; // Fix the import issue

// import { storeFile, viewFile, deleteFile } from "../helper/storage";
import path from "path";
import { encrypt } from "../../helper/encrypt";
import { CurrentTime } from "../../helper/common";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateTokenWithExpire } from "../../helper/token";
import {
  duplicateCheckQuery,
  getPartnerValidityQuery,
  insertTransactionMappingQuery,
  transactionMappingQuery,
  updateHistoryQuery,
} from "./query";

export class mappingRepository {
  public async AddTransactionMappingV1(
    userData: any,
    tokendata: any
  ): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
      await client.query("BEGIN");

      const mappingData = userData.mappingData;
      console.log("mappingData", mappingData);

      if (!Array.isArray(mappingData) || mappingData.length === 0) {
        await client.query("ROLLBACK");
        return encrypt(
          {
            success: false,
            message: "Invalid or empty mapping data",
          },
          true
        );
      }

      // Extract vendorLeaf values for duplicate check
      const vendorLeafValues = mappingData.map(({ vendorLeaf }) => vendorLeaf);
      console.log("vendorLeafValues", vendorLeafValues);

      // Query to check if any vendorLeaf already exists

      const { rows: duplicateRows } = await client.query(duplicateCheckQuery, [
        vendorLeafValues,
      ]);

      if (duplicateRows.length > 0) {
        await client.query("ROLLBACK");
        return encrypt(
          {
            success: false,
            message: `Duplicate vendorLeaf values found: ${duplicateRows
              .map((row) => row.leaf)
              .join(", ")}`,
          },
          true
        );
      }

      const values: (string | number)[] = [];

      for (const { vendor, vendorLeaf, purchasedDate } of mappingData) {
        // Fetch validity period from partners table
        const { rows: partnerRows } = await client.query(
          getPartnerValidityQuery,
          [vendor]
        );
        console.log("partnerRows", partnerRows);

        if (partnerRows.length === 0) {
          await client.query("ROLLBACK");
          return encrypt(
            {
              success: false,
              message: `Partner with ID ${vendor} not found`,
            },
            true
          );
        }

        const validityDays = partnerRows[0].validity;
        console.log("validityDays", validityDays);

        const validityDate = moment(purchasedDate)
          .add(validityDays, "days")
          .format("YYYY-MM-DD");

        // Add values for batch insert
        values.push(
          "Not Assigned",
          vendor,
          vendorLeaf,
          purchasedDate,
          validityDate
        );
      }

      const query = insertTransactionMappingQuery(mappingData.length);
      const { rows } = await client.query(query, values);

      if (rows.length === 0) {
        await client.query("ROLLBACK");
        return encrypt(
          {
            success: false,
            message: "Failed to insert transaction mapping",
          },
          true
        );
      }

      const txnHistoryParams = [
        14,
        tokendata.id,
        "Inserted transaction mapping details",
        moment().format("YYYY-MM-DD HH:mm:ss"),
        "admin",
      ];
      await client.query(updateHistoryQuery, txnHistoryParams);

      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message: "Transaction mapping inserted successfully",
          data: rows,
          token: tokens,
        },
        true
      );
    } catch (error: unknown) {
      await client.query("ROLLBACK");
      return encrypt(
        {
          success: false,
          message: "Failed to insert transaction mapping",
          error: (error as Error).message,
          token: tokens,
        },
        true
      );
    } finally {
      client.release();
    }
  }

  public async transactionMappingV1(
    userData: any,
    tokendata: any
  ): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
      await client.query("BEGIN");

      // Fetch vendor details
      const queryResult = await client.query(transactionMappingQuery);

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
      console.log("vendorDetails:", vendorDetails);

      // Insert transaction history
      const txnHistoryParams = [
        13, // TransTypeID
        tokendata.id, // refUserId (Modify as needed)
        "Fetched vendor details",
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
          message: "Failed to fetch vendor details",
          error: errorMessage,
          token: tokens,
        },
        true
      );
    } finally {
      client.release();
    }
  }
}
