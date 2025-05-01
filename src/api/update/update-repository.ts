import { executeQuery, getClient } from "../../helper/db";
import { PoolClient } from "pg";
// import { storeFile, viewFile, deleteFile } from "../helper/storage";
import path from "path";
import { encrypt } from "../../helper/encrypt";
import { CurrentTime } from "../../helper/common";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateTokenWithExpire } from "../../helper/token";
import {
    deleteCustomerQuery,
  deletePartnerQuery,
  deletePricingQuery,
  getCustomerQuery,
  getPartnerQuery,
  updateCustomerQuery,
  updateHistoryQuery,
  updatePartnerQuery,
  updateQuery,
} from "./query";

export class updateRepository {
  public async updatePartnersV1(user_data: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
      await client.query("BEGIN");

      const { partnersName, phoneNumber, validity, partnerId } = user_data;

      const Params = [partnersName, phoneNumber, validity, partnerId];

      const partnerDetails = await client.query(updatePartnerQuery, Params);

      const txnHistoryParams = [
        3,
        tokendata.id,
        `${partnersName} partner updated successfully`,
        CurrentTime(),
        "Admin",
      ];
      const txnHistoryResult = await client.query(
        updateHistoryQuery,
        txnHistoryParams
      );
      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message: "update partners successfully",
          data: partnerDetails.rows,
          token: tokens,
        },
        true
      );
    } catch (error: any) {
      await client.query("ROLLBACK");

      console.error("Error during update partners:", error);

      return encrypt(
        {
          success: false,
          message: "update partners failed",
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
          token: tokens,
        },
        true
      );
    } finally {
      client.release();
    }
  }
  public async updateCustomersV1(userData: any, tokenData: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokenData.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
      await client.query("BEGIN"); // Start transaction

      const {
        customerName,
        customerCode,
        notes,
        customerType,
        refAddress,
        refPhone,
        refCustomerId,
      } = userData;

      if (!refCustomerId) {
        return encrypt(
          {
            success: false,
            message: "Invalid request: refCustomerId is required.",
            token: tokens,
          },
          true
        );
      }

      // Fetch the existing customer data
      const existingCustomerResult = await client.query(getCustomerQuery, [
        refCustomerId,
      ]);

      if (existingCustomerResult.rowCount === 0) {
        return encrypt(
          {
            success: false,
            message: "Customer record not found.",
            token: tokens,
          },
          true
        );
      }

      const existingCustomer = existingCustomerResult.rows[0];

      // Extract refCustId from the result
      const { refCustId } = existingCustomer; // This is where refCustId is extracted

      let updatedRefCustId = refCustId;

      if (customerCode && customerCode !== existingCustomer.refCode) {
        // Convert refCustomerId to a string if it's not already
        const refCustIdStr = refCustId.toString();
        console.log("refCustId", refCustIdStr);

        // Split by "-" and check parts
        const refCustIdParts = refCustIdStr.split("-");
        console.log("refCustIdParts:", refCustIdParts); // Debug log

        const nextCustomerNumber = refCustIdParts[2];
        const currentMonth = refCustIdParts[3];
        const currentYear = refCustIdParts[4];

        updatedRefCustId = `R-${customerCode}-${nextCustomerNumber}-${currentMonth}-${currentYear}`;

        console.log("Updated refCustId:", updatedRefCustId); // Debug log
      }

      // Update Customer
      const updateParams = [
        updatedRefCustId,
        customerName,
        customerCode,
        notes,
        customerType,
        refAddress,
        refPhone,
        refCustomerId,
      ];

      const updatedCustomer = await client.query(
        updateCustomerQuery,
        updateParams
      );

      if (updatedCustomer.rowCount === 0) {
        await client.query("ROLLBACK");
        return encrypt(
          {
            success: false,
            message: "Customer update failed.",
            token: tokens,
          },
          true
        );
      }

      // Insert Transaction History
      const txnHistoryParams = [
        6,
        tokenData.id,
        `Customer updated (refCustId: ${updatedRefCustId})`,
        CurrentTime(),
        "Admin",
      ];
      await client.query(updateHistoryQuery, txnHistoryParams);

      await client.query("COMMIT"); // Commit transaction

      return encrypt(
        {
          success: true,
          message: "Customer updated successfully.",
          token: tokens,
          data: { ...updatedCustomer.rows[0], refCustId: updatedRefCustId },
        },
        true
      );
    } catch (error) {
      await client.query("ROLLBACK"); // Rollback transaction on failure
      console.error("Error during Customer update:", error);

      return encrypt(
        {
          success: false,
          message: "Customer update failed.",
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
          token: tokens,
        },
        true
      );
    } finally {
      client.release(); // Ensure client is released
    }
  }
  public async updatePricingV1(userData: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
      await client.query("BEGIN"); // Start Transaction

      const {
        pricingId, // ID of the record to update
        partnersId,
        minWeight,
        maxWeight,
        price,
        dimension,
        answer,
        length,
        breadth,
        height,
        calculation,
      } = userData;

      if (!pricingId || !partnersId || !minWeight || !maxWeight || !price) {
        return encrypt(
          {
            success: false,
            message: "Missing required fields.",
            token: tokens,
          },
          true
        );
      }

      // Validate dimension fields if `dimension` is true
      if (dimension) {
        if (!length || !breadth || !height || !calculation) {
          return encrypt(
            {
              success: false,
              message: "Missing dimension details.",
              token: tokens,
            },
            true
          );
        }
      }

      const updateParams = [
        partnersId,
        minWeight,
        maxWeight,
        price,
        dimension ? 1 : 0,
        dimension ? length : null,
        dimension ? breadth : null,
        dimension ? height : null,
        dimension ? calculation : null,
        answer,
        CurrentTime(),
        tokendata.id,
        pricingId, // ID in WHERE clause
      ];

      const result = await client.query(updateQuery, updateParams);

      if (result.rowCount === 0) {
        throw new Error("No record found to update.");
      }

      // Insert transaction history
      const txnHistoryParams = [
        16, // action ID for "update pricing"
        tokendata.id,
        "Updated price details",
        CurrentTime(),
        "admin",
      ];
      await client.query(updateHistoryQuery, txnHistoryParams);

      await client.query("COMMIT"); // Commit Transaction

      return encrypt(
        {
          success: true,
          message: "Weight details updated successfully.",
          data: result.rows[0],
          token: tokens,
        },
        true
      );
    } catch (error: any) {
      await client.query("ROLLBACK");

      console.error("Error during weight details update:", error);

      return encrypt(
        {
          success: false,
          message: "Weight details update failed",
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
          token: tokens,
        },
        true
      );
    } finally {
      client.release(); // Release DB connection
    }
  }
  public async deletePartnersV1(userData: any, tokenData: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokenData.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
      const { partnerId } = userData;

      if (!partnerId) {
        return encrypt(
          {
            success: false,
            message: "Invalid request: partnerId is required.",
            token: tokens,
          },
          true
        );
      }

      await client.query("BEGIN");

      // Check if the partner exists before attempting an update
      const existingPartner = await client.query(getPartnerQuery, [partnerId]);

      if (existingPartner.rowCount === 0) {
        await client.query("ROLLBACK");
        return encrypt(
          {
            success: false,
            message: "Partner record not found.",
            token: tokens,
          },
          true
        );
      }

      await client.query(deletePartnerQuery, [
        partnerId, 
        CurrentTime(),
        tokenData.id]);

      // Log transaction history
      const transactionValues = [
        4, // Transaction type ID for delete
        tokenData.id,
        "Partner Soft Deleted",
        CurrentTime(),
        "Admin",
      ];
      await client.query(updateHistoryQuery, transactionValues);

      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message: "Partner marked as deleted successfully.",
          token: tokens,
        },
        true
      );
    } catch (error) {
      console.error("Error marking Partner as deleted:", error);
      await client.query("ROLLBACK");

      return encrypt(
        {
          success: false,
          message: `Error marking Partner as deleted: ${
            (error as Error).message
          }`,
          token: tokens,
        },
        true
      );
    } finally {
      client.release();
    }
  }
  public async deleteCustomersV1(userData: any, tokenData: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokenData.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
      const { refCustomerId } = userData;

      if (!refCustomerId) {
        return encrypt(
          {
            success: false,
            message: "Invalid request: refCustomerId is required.",
            token: tokens,
          },
          true
        );
      }

      await client.query("BEGIN");

      // Check if the partner exists before attempting an update
      const existingPartner = await client.query(getCustomerQuery, [refCustomerId]);

      if (existingPartner.rowCount === 0) {
        await client.query("ROLLBACK");
        return encrypt(
          {
            success: false,
            message: "customer record not found.",
            token: tokens,
          },
          true
        );
      }

      await client.query(deleteCustomerQuery, [refCustomerId, CurrentTime(),tokenData.id]);

      // Log transaction history
      const transactionValues = [
        17, // Transaction type ID for delete
        tokenData.id,
        "customer Soft Deleted",
        CurrentTime(),
        "Admin",
      ];
      await client.query(updateHistoryQuery, transactionValues);

      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message: "customer marked as deleted successfully.",
          token: tokens,
        },
        true
      );
    } catch (error) {
      console.error("Error marking customer as deleted:", error);
      await client.query("ROLLBACK");

      return encrypt(
        {
          success: false,
          message: `Error marking customer as deleted: ${
            (error as Error).message
          }`,
          token: tokens,
        },
        true
      );
    } finally {
      client.release();
    }
  }
  public async deletePricingV1(userData: any, tokenData: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokenData.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
      const { pricingId } = userData;

      if (!pricingId) {
        return encrypt(
          {
            success: false,
            message: "Invalid request: priceID is required.",
            token: tokens,
          },
          true
        );
      }

      await client.query("BEGIN");

      // Check if the partner exists before attempting an update
    //   const existingPartner = await client.query(getPartnerQuery, [pricingId]);

    //   if (existingPartner.rowCount === 0) {
    //     await client.query("ROLLBACK");
    //     return encrypt(
    //       {
    //         success: false,
    //         message: "price record not found.",
    //         token: tokens,
    //       },
    //       true
    //     );
    //   }

      await client.query(deletePricingQuery, [pricingId, CurrentTime(),tokenData.id]);

      // Log transaction history
      const transactionValues = [
        18, // Transaction type ID for delete
        tokenData.id,
        "price Soft Deleted",
        CurrentTime(),
        "Admin",
      ];
      await client.query(updateHistoryQuery, transactionValues);

      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message: "price marked as deleted successfully.",
          token: tokens,
        },
        true
      );
    } catch (error) {
      console.error("Error marking price as deleted:", error);
      await client.query("ROLLBACK");

      return encrypt(
        {
          success: false,
          message: `Error marking price as deleted: ${
            (error as Error).message
          }`,
          token: tokens,
        },
        true
      );
    } finally {
      client.release();
    }
  }
}
