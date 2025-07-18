import { executeQuery, getClient } from "../../helper/db";
import { PoolClient } from "pg";
// import { storeFile, viewFile, deleteFile } from "../helper/storage";
import path from "path";
import { encrypt } from "../../helper/encrypt";
import { CurrentTime } from "../../helper/common";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import qs from "qs";
import { generateTokenWithExpire } from "../../helper/token";
import {
  getParcelBookingQuery,
  parcelBookingQuery,
  refCustIdQuery,
  updateHistoryQuery,
  updateRefStatusQuery,
  vendorLeafQuery,
  parselBookingData,
  refParcelBookingQuery,
  refParcelBookingDataQuery,
  refParcelBookingUpdateQuery,
  parcelBookingUpdateQuery,
  getPaymentQuery,
  getCustomerQuery,
  addFinanceQuery,
  updateFinanceQuery,
  getFinanceDataQuery,
  getParcelBookingCount,
  getfinanceDataQuery,
  getReportDataQuery,
  updateVendorLeaf,
  vendorParcelBookingQuery,
} from "./query";
import { invoiceNumberChecking } from "../admin/query";
import axios from "axios";
import logger from "../../helper/logger";

export class bookingRepository {
  public async parcelBookingV1(userData: any, tokenData: any): Promise<any> {
    console.log("userData", userData);
    const client: PoolClient = await getClient();
    const token = { id: tokenData.id };
    const tokens = generateTokenWithExpire(token, true);

    const ParcelBookingFromVendor = async (
      result: any,
      vendors: string,
      status: string
    ) => {
      console.log(`📦 ParcelBookingFromVendor called for ${vendors}`);
      console.log("userData in repository", userData);

      let invoiceNum = null;
      if (userData.payload?.invoice_number) {
        invoiceNum = userData.payload.invoice_number;
      } else if (
        userData.payload?.shipments &&
        userData.payload.shipments.length > 0 &&
        userData.payload.shipments[0]?.order
      ) {
        invoiceNum = userData.payload.shipments[0].order;
      }

      console.log("Final invoice number used:", invoiceNum);

      const {
        vendor,
        leaf,
        type,
        origin,
        destination,
        consignorName,
        consignorAddress,
        consignorCity,
        consignorState,
        consignorGSTnumber,
        consignorPhone,
        consignorEmail,
        customerRefNo,
        consigneeName,
        consigneeAddress,
        consigneeCity,
        consigneeState,
        consigneeGSTnumber,
        consigneePhone,
        consigneeEmail,
        contentSpecification,
        paperEnclosed,
        declaredValue,
        NoOfPieces,
        actualWeight,
        dimension,
        height,
        weight,
        breadth,
        chargedWeight,
        paymentId,
        customerType,
        refCustomerId,
        netAmount,
        pickUP,
        count,
        formattedDate,
        consignorPincode,
        consigneePincode,
        refCustomerName,
        refCode,
      } = userData;

      const resultData = JSON.stringify(result); // assuming `result` from API response
      const leafData = JSON.stringify(leaf); // convert to JSON for PostgreSQL
      const typeData = JSON.stringify(type);
      const createdAt = new Date();

      const vendorLeaf = JSON.parse(leaf).vendorLeaf;

      const query = `
        UPDATE public.transactionmapping
        SET "refStatus" = 'Assigned'
        WHERE leaf = $1
      `;

      const changeValidData = await executeQuery(query, [vendorLeaf]);
      console.log("changeValidData", changeValidData);

      const values = [
        vendor,
        leafData,
        typeData,
        origin,
        destination,
        consignorName,
        consignorAddress,
        consignorCity,
        consignorState,
        consignorGSTnumber,
        consignorPhone,
        consignorEmail,
        customerRefNo,
        consigneeName,
        consigneeAddress,
        consigneeCity,
        consigneeState,
        consigneeGSTnumber,
        consigneePhone,
        consigneeEmail,
        contentSpecification,
        paperEnclosed,
        declaredValue,
        NoOfPieces,
        actualWeight,
        dimension,
        height,
        weight,
        breadth,
        chargedWeight,
        paymentId,
        customerType,
        refCustomerId,
        netAmount,
        pickUP,
        count,
        formattedDate,
        consignorPincode,
        consigneePincode,
        resultData, // ⬅️ add final API result (as JSON string)
        createdAt,
        refCustomerName,
        refCode,
        status,
        invoiceNum,
      ];
      const insertingVendorBooking = await executeQuery(
        vendorParcelBookingQuery,
        values
      );
      console.log("insertingVendorBooking", insertingVendorBooking);

      if (status === "success") {
        console.log("✅ Success - Data:", JSON.stringify(result, null, 2));
        if (userData.paymentId === 3) {
          const refCustomerName = userData.refCustomerId;
          const netAmount = userData.netAmount.toString(); // Ensure string format
          const createdAt = new Date().toISOString();
          const createdBy = "System"; // replace with real user if available

          // 1. Check if customer exists
          const checkQuery = `
          SELECT * FROM public."refFinanceTable"
          WHERE "refCustomerName" = $1
        `;
          const existing = await executeQuery(checkQuery, [refCustomerName]);

          if (existing.length > 0) {
            // 2. Customer exists → update

            const existingOutstanding = parseFloat(
              existing[0].refOutstandingAmt || "0"
            );
            const newOutstanding = (
              existingOutstanding + parseFloat(netAmount)
            ).toFixed(2);

            const updateQuery = `
            UPDATE public."refFinanceTable"
            SET "refOutstandingAmt" = $2,
                "refBalanceAmount" = $2,
                "updatedAt" = $3,
                "updatedBy" = $4
            WHERE "refCustomerName" = $1
          `;

            await executeQuery(updateQuery, [
              refCustomerName,
              newOutstanding.toString(),
              createdAt,
              createdBy,
            ]);
            console.log("🔁 Updated existing finance record");
          } else {
            // 3. Customer does not exist → insert

            const insertQuery = `
            INSERT INTO public."refFinanceTable" (
              "refCustomerName",
              "refOutstandingAmt",
              "refPayAmount",
              "refBalanceAmount",
              "createdAt",
              "createdBy"
            ) VALUES ($1, $2, '', $2, $3, $4)
          `;

            await executeQuery(insertQuery, [
              refCustomerName,
              netAmount,
              createdAt,
              createdBy,
            ]);
            console.log("🆕 Inserted new finance record");
          }
        }

        return { success: true, message: result };
      } else {
        console.log("⚠️ Failure - Data:", JSON.stringify(result, null, 2));
        return { success: false, message: result };
      }
    };

    try {
      const generateInvoiceNumber = async (prefix: any) => {
        const invoiceCheckQuery = await executeQuery(invoiceNumberChecking);
        console.log("invoiceCheckQuery", invoiceCheckQuery);
        const count = parseInt(invoiceCheckQuery[0].count) + 1;
        console.log("count", count);

        const baseNumber = 10000 + count;

        const currentDate = new Date();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
        const year = currentDate.getFullYear().toString().slice(-2);

        const suffix = `${month}${year}`;
        return `${prefix}${baseNumber}${suffix}`;
      };

      if (userData.vendor === "DTDC") {
        const invoiceNumber = await generateInvoiceNumber("RDTDC");
        console.log("invoiceNumber", invoiceNumber);
        logger.info("Invoice number generated", invoiceNumber);

        userData.payload = {
          ...userData.payload,
          invoice_number: invoiceNumber,
        };

        console.log("userData.payload", userData.payload);
        const response = await axios.post(
          "https://dtdcapi.shipsy.io/api/customer/integration/consignment/softdata",
          userData.payload,
          {
            headers: {
              "Content-Type": "application/json",
              "api-key": "5dd8e4d35166672758bd1ee8953025",
            },
          }
        );

        console.log("response", response.data);

        logger.info("DTDC response captured ---> ", response);

        if (
          response.data.status === "OK" &&
          Array.isArray(response.data.data) &&
          response.data.data.length > 0
        ) {
          const result = response.data.data[0];

          // Pass success result to the function

          logger.info("DTDC parcel booking vendor result", result);

          if (result.success) {
            const vendorResponse = await ParcelBookingFromVendor(
              result,
              "DTDC",
              "success"
            );
            return encrypt({ ...vendorResponse, token: tokens }, true);
          } else {
            console.log("Consignment API error:", result);
            logger.warn("DTDC API error", result);
            const vendorResponse = await ParcelBookingFromVendor(
              result,
              "DTDC",
              "failure"
            );
            return encrypt({ ...vendorResponse, token: tokens }, true);
          }
        } else {
          console.log("DTDC API Failure:", response.data);

          // Pass failure data to the function
          await ParcelBookingFromVendor(response.data, "DTDC", "failure");
          logger.warn("DTDC error failed", response);

          return encrypt(
            {
              success: false,
              message: response.data || { error: "Unknown error" },
              token: tokens,
            },
            true
          );
        }
      } else if (userData.vendor === "Delhivery") {
        const invoiceNumber = await generateInvoiceNumber("DLVY");

        logger.info("DElhivery invoice generated", invoiceNumber);
        const updatedPayload = {
          format: "json",
          data: JSON.stringify({
            ...userData.payload,
            pickup_location: {
              ...userData.payload.pickup_location,
            },
            shipments: userData.payload.shipments.map((shipment: any) => ({
              ...shipment,
              order: invoiceNumber,
            })),
          }),
        };

        const res = await axios.post(
          "https://track.delhivery.com/api/cmu/create.json",
          qs.stringify(updatedPayload),
          {
            headers: {
              Accept: "application/json",
              Authorization: "Token f4881f7518b05af9e0e3446b8b697c490dbef74f",
            },
          }
        );

        const data = res.data;
        logger.info("Delhivery response", res);

        if (data.success && data.packages?.length > 0) {
          const pkg = data.packages[0];
          if (pkg.status === "Success" && pkg.waybill) {
            const vendorResponse = await ParcelBookingFromVendor(
              pkg,
              "Delhivery",
              "success"
            );
            return encrypt({ ...vendorResponse, token: tokens }, true);
          } else {
            const vendorResponse = await ParcelBookingFromVendor(
              pkg,
              "Delhivery",
              "failure"
            );
            return encrypt({ ...vendorResponse, token: tokens }, true);
          }
        } else {
          const vendorResponse = await ParcelBookingFromVendor(
            data,
            "Delhivery",
            "failure"
          );
          return encrypt({ ...vendorResponse, token: tokens }, true);
        }
      } else {
        console.log("Partners name is not configured");
      }
    } catch (error) {
      console.error("Main try-catch error:", error);
      return encrypt(
        {
          success: false,
          message: "Unexpected error occurred.",
          token: tokens,
        },
        true
      );
    } finally {
      client.release();
    }
  }

  // public async UpdateBulkParcelBookingDataV1(
  //   user_data: any,
  //   tokendata: any
  // ): Promise<any> {
  //   const client: PoolClient = await getClient();
  //   const token = { id: tokendata.id };
  //   const tokens = generateTokenWithExpire(token, true);

  //   try {
  //     await client.query("BEGIN");

  //     logger.info("user data", user_data);
  //     const mappingData = user_data.mappingData;

  //     logger.info("Mapping data", mappingData);

  //     if (!Array.isArray(mappingData) || mappingData.length === 0) {
  //       await client.query("ROLLBACK");
  //       return encrypt(
  //         {
  //           success: false,
  //           message: "Invalid or empty parcel data",
  //           token: tokens,
  //         },
  //         true
  //       );
  //     }

  //     logger.info("before duplication --------- > ");
  //     // Duplicate check
  //     const duplicateValues = mappingData.map(
  //       (row: any, index: number) => row.DSR_CNNO
  //     );
  //     const duplicatePlaceholders = duplicateValues
  //       .map((_, index) => `$${index + 1}`)
  //       .join(", ");

  //     const duplicateQuery = `
  //       SELECT dsr_cnno
  //       FROM public."bulkParcelDataMapping"
  //       WHERE dsr_cnno IN (${duplicatePlaceholders})
  //     `;

  //     const { rows: duplicateRows } = await client.query(
  //       duplicateQuery,
  //       duplicateValues
  //     );

  //     if (duplicateRows.length > 0) {
  //       const duplicates = duplicateRows
  //         .map((row) => `CNNO: ${row.dsr_cnno}`)
  //         .join("; ");

  //       await client.query("ROLLBACK");
  //       return encrypt(
  //         {
  //           success: false,
  //           message: `Duplicate parcel records found: ${duplicates}`,
  //           token: tokens,
  //         },
  //         true
  //       );
  //     }

  //     // Define the column names in order
  //     const columns = [
  //       "DSR_BRANCH_CODE",
  //       "DSR_CNNO",
  //       "DSR_BOOKED_BY",
  //       "DSR_CUST_CODE",
  //       "DSR_CN_WEIGHT",
  //       "DSR_CN_TYPE",
  //       "DSR_DEST",
  //       "DSR_MODE",
  //       "DSR_NO_OF_PIECES",
  //       "DSR_DEST_PIN",
  //       "DSR_BOOKING_DATE",
  //       "DSR_AMT",
  //       "DSR_STATUS",
  //       "DSR_POD_RECD",
  //       "DSR_BOOKING_TIME",
  //       "DSR_DOX",
  //       "DSR_SERVICE_TAX",
  //       "DSR_SPL_DISC",
  //       "DSR_CONTENTS",
  //       "DSR_REMARKS",
  //       "DSR_VALUE",
  //       "DSR_INVNO",
  //       "DSR_INVDATE",
  //       "MOD_DATE",
  //       "OFFICE_TYPE",
  //       "OFFICE_CODE",
  //       "DSR_REFNO",
  //       "MOD_TIME",
  //       "NODEID",
  //       "USERID",
  //       "TRANS_STATUS",
  //       "DSR_ACT_CUST_CODE",
  //       "DSR_MOBILE",
  //       "DSR_EMAIL",
  //       "DSR_NDX_PAPER",
  //       "DSR_PICKUP_TIME",
  //       "DSR_VOL_WEIGHT",
  //       "DSR_CAPTURED_WEIGHT",
  //       "DSR_ID_NUM",
  //       "FR_DP_CODE",
  //     ];

  //     const values: any[] = [];
  //     const placeholders: string[] = [];

  //     mappingData.forEach((row, rowIndex) => {
  //       const rowPlaceholders: string[] = [];

  //       columns.forEach((col, colIndex) => {
  //         values.push(row[col] || null); // Push value or null
  //         rowPlaceholders.push(`$${rowIndex * columns.length + colIndex + 1}`);
  //       });

  //       placeholders.push(`(${rowPlaceholders.join(", ")})`);
  //     });

  //     const query = `
  //     INSERT INTO public."bulkParcelDataMapping" (${columns.join(", ")})
  //     VALUES ${placeholders.join(", ")}
  //   `;

  //     logger.info("query", query);

  //     const result = await client.query(query, values);
  //     console.log("result", result);
  //     logger.info("result", result);

  //     await client.query("COMMIT");

  //     return encrypt(
  //       {
  //         success: true,
  //         message: "Parcel booking data inserted successfully",
  //         token: tokens,
  //       },
  //       true
  //     );
  //   } catch (error: unknown) {
  //     logger.error("error", error);
  //     await client.query("ROLLBACK");
  //     return encrypt(
  //       {
  //         success: false,
  //         message: "Failed to insert parcel booking data",
  //         error: (error as Error).message,
  //         token: tokens,
  //       },
  //       true
  //     );
  //   } finally {
  //     client.release();
  //   }
  // }
  public async UpdateBulkParcelBookingDataV1(
    user_data: any,
    tokendata: any
  ): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
      await client.query("BEGIN");

      const mappingData = user_data.mappingData;

      if (!Array.isArray(mappingData) || mappingData.length === 0) {
        await client.query("ROLLBACK");
        return encrypt(
          {
            success: false,
            message: "Invalid or empty parcel data",
            token: tokens,
          },
          true
        );
      }

      // Duplicate check
      const duplicateValues = mappingData.map((row: any) => row.DSR_CNNO);
      const duplicatePlaceholders = duplicateValues
        .map((_, index) => `$${index + 1}`)
        .join(", ");

      const duplicateQuery = `
      SELECT dsr_cnno
      FROM public."bulkParcelDataMapping"
      WHERE dsr_cnno IN (${duplicatePlaceholders})
    `;

      const { rows: duplicateRows } = await client.query(
        duplicateQuery,
        duplicateValues
      );

      if (duplicateRows.length > 0) {
        const duplicates = duplicateRows
          .map((row) => `CNNO: ${row.dsr_cnno}`)
          .join("; ");

        await client.query("ROLLBACK");
        return encrypt(
          {
            success: false,
            message: `Duplicate parcel records found: ${duplicates}`,
            token: tokens,
          },
          true
        );
      }

      const columns = [
        "DSR_BRANCH_CODE",
        "DSR_CNNO",
        "DSR_BOOKED_BY",
        "DSR_CUST_CODE",
        "DSR_CN_WEIGHT",
        "DSR_CN_TYPE",
        "DSR_DEST",
        "DSR_MODE",
        "DSR_NO_OF_PIECES",
        "DSR_DEST_PIN",
        "DSR_BOOKING_DATE",
        "DSR_AMT",
        "DSR_STATUS",
        "DSR_POD_RECD",
        "DSR_BOOKING_TIME",
        "DSR_DOX",
        "DSR_SERVICE_TAX",
        "DSR_SPL_DISC",
        "DSR_CONTENTS",
        "DSR_REMARKS",
        "DSR_VALUE",
        "DSR_INVNO",
        "DSR_INVDATE",
        "MOD_DATE",
        "OFFICE_TYPE",
        "OFFICE_CODE",
        "DSR_REFNO",
        "MOD_TIME",
        "NODEID",
        "USERID",
        "TRANS_STATUS",
        "DSR_ACT_CUST_CODE",
        "DSR_MOBILE",
        "DSR_EMAIL",
        "DSR_NDX_PAPER",
        "DSR_PICKUP_TIME",
        "DSR_VOL_WEIGHT",
        "DSR_CAPTURED_WEIGHT",
        "DSR_ID_NUM",
        "FR_DP_CODE",
      ];

      const batchSize = 200;

      for (let i = 0; i < mappingData.length; i += batchSize) {
        const batch = mappingData.slice(i, i + batchSize);
        const values: any[] = [];
        const placeholders: string[] = [];

        batch.forEach((row, rowIndex) => {
          const rowPlaceholders: string[] = [];

          columns.forEach((col, colIndex) => {
            values.push(row[col] !== undefined ? row[col] : null);
            rowPlaceholders.push(
              `$${rowIndex * columns.length + colIndex + 1}`
            );
          });

          placeholders.push(`(${rowPlaceholders.join(", ")})`);
        });

        const query = `
        INSERT INTO public."bulkParcelDataMapping" (${columns.join(", ")})
        VALUES ${placeholders.join(", ")}
      `;

        if (values.length !== batch.length * columns.length) {
          await client.query("ROLLBACK");
          return encrypt(
            {
              success: false,
              message: `Mismatch between placeholders and values in batch. Skipping insert.`,
              token: tokens,
            },
            true
          );
        }

        await client.query(query, values);
      }

      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message: "Parcel booking data inserted successfully",
          token: tokens,
        },
        true
      );
    } catch (error: unknown) {
      await client.query("ROLLBACK");
      return encrypt(
        {
          success: false,
          message: "Failed to insert parcel booking data",
          error: (error as Error).message,
          token: tokens,
        },
        true
      );
    } finally {
      client.release();
    }
  }

  public async FetchBulkMappedParcelData(
    user_data: any,
    tokendata: any
  ): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
      await client.query("BEGIN");

      const query = `SELECT * FROM public."bulkParcelDataMapping"`;

      const result = await client.query(query);
      console.log("result", result);

      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message: "Parcel booking data inserted successfully",
          token: tokens,
          result: result.rows,
        },
        true
      );
    } catch (error: unknown) {
      await client.query("ROLLBACK");
      return encrypt(
        {
          success: false,
          message: "Failed to insert parcel booking data",
          error: (error as Error).message,
          token: tokens,
        },
        true
      );
    } finally {
      client.release();
    }
  }

  public async updateBookingV1(
    userData: any,
    tokenData: any,
    isRefParcel: boolean
  ): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokenData.id };
    const tokens = generateTokenWithExpire(token, true); // Assuming token generation is needed

    try {
      await client.query("BEGIN"); // Start transaction

      const {
        partnersName,
        type,
        origin,
        destination,
        consignorName,
        consignorAddress,
        consignorGSTnumber,
        consignorPhone,
        consignorEmail,
        customerRefNo,
        consigneeName,
        consigneeAddress,
        consigneeGSTnumber,
        consigneePhone,
        consigneeEmail,
        contentSpecification,
        paperEnclosed,
        declaredValue,
        NoOfPieces,
        actualWeight,
        dimension,
        height,
        weight,
        breadth,
        chargedWeight,
        paymentId,
        customerType,
        refCustomerId,
        netAmount,
        pickUP,
        count,
        consignorPincode,
        consigneePincode,
        parcelBookingId,
        isRefParcel,
      } = userData;

      // Validate required fields
      if (!parcelBookingId) {
        return encrypt(
          {
            success: false,
            token: tokens,
            message: "Missing parcelBookingId.",
          },
          true
        );
      }

      const customerTypeBoolean =
        customerType === true || customerType === "true";

      // Update `parcelBooking` table if isRefParcel is true
      if (isRefParcel === true) {
        const updateResult = await client.query(parcelBookingUpdateQuery, [
          partnersName,
          refCustomerId,
          customerTypeBoolean,
          paymentId,
          type,
          origin,
          destination,
          consignorName,
          consignorAddress,
          consignorGSTnumber,
          consignorPhone,
          consignorEmail,
          customerRefNo,
          consigneeName,
          consigneeAddress,
          consigneeGSTnumber,
          consigneePhone,
          consigneeEmail,
          contentSpecification,
          paperEnclosed,
          declaredValue,
          NoOfPieces,
          actualWeight,
          dimension ? 1 : 0,
          dimension ? height : null,
          dimension ? weight : null,
          dimension ? breadth : null,
          dimension ? chargedWeight : null,
          netAmount,
          pickUP,
          consignorPincode,
          consigneePincode,
          parcelBookingId,
        ]);
      }

      // Update `refParcelBooking` table if isRefParcel is false
      if (isRefParcel === false) {
        const updateResult = await client.query(refParcelBookingUpdateQuery, [
          partnersName,
          refCustomerId,
          customerTypeBoolean,
          paymentId,
          type,
          origin,
          destination,
          consignorName,
          consignorAddress,
          consignorGSTnumber,
          consignorPhone,
          consignorEmail,
          customerRefNo,
          consigneeName,
          consigneeAddress,
          consigneeGSTnumber,
          consigneePhone,
          consigneeEmail,
          contentSpecification,
          paperEnclosed,
          declaredValue,
          NoOfPieces,
          actualWeight,
          dimension ? 1 : 0,
          dimension ? height : null,
          dimension ? weight : null,
          dimension ? breadth : null,
          dimension ? chargedWeight : null,
          netAmount,
          pickUP,
          consignorPincode,
          consigneePincode,
          parcelBookingId,
        ]);
      }

      await client.query("COMMIT"); // Commit transaction

      return encrypt(
        {
          success: true,
          message: "Parcel booking details updated successfully.",
          token: tokens,
        },
        true
      );
    } catch (error: any) {
      console.log("Error updating booking:", error);
      await client.query("ROLLBACK");
      return encrypt(
        {
          success: false,
          message: "Parcel booking update failed.",
          error: error.message || "An unknown error occurred",
          token: tokens,
        },
        true
      );
    } finally {
      client.release();
    }
  }
  public async paymentModeV1(user_data: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id }; // Extract token ID

    // Generate token with expiration
    const tokens = generateTokenWithExpire(token, true);

    try {
      const payment = await executeQuery(getPaymentQuery);

      // Return success response
      return encrypt(
        {
          success: true,
          message: "Returned paymennts successfully",
          token: tokens,
          paymentMode: payment,
        },
        true
      );
    } catch (error) {
      // Error handling
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error during data retrieval:", error);

      // Return error response
      return encrypt(
        {
          success: false,
          message: "Data retrieval failed",
          error: errorMessage,
          token: tokens,
        },
        true
      );
    }
  }

  public async viewBookingV1(userData: any, tokenData: any): Promise<any> {
    const token = { id: tokenData.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
      const parcelBookingId = userData.parcelBookingId;

      if (!parcelBookingId) {
        throw new Error(
          "Invalid parcelBookingId. Cannot be null or undefined."
        );
      }

      const bookingResult = await executeQuery(getParcelBookingQuery, [
        parcelBookingId,
      ]);

      if (bookingResult.length === 0) {
        throw new Error(
          "No parcel booking data found for the given parcelBookingId."
        );
      }

      const bookingData = {
        bookingId: bookingResult[0].parcelBookingId,
        partnersId: bookingResult[0].partnersId,
        type: bookingResult[0].type,
        origin: bookingResult[0].origin,
        destination: bookingResult[0].destination,
        consignor: {
          name: bookingResult[0].consignorName,
          address: bookingResult[0].consignorAddress,
          phone: bookingResult[0].consignorPhone,
          email: bookingResult[0].consignorEmail,
          gstNumber: bookingResult[0].consignorGSTnumber,
        },
        consignee: {
          name: bookingResult[0].consigneeName,
          address: bookingResult[0].consigneeAddress,
          phone: bookingResult[0].consigneePhone,
          email: bookingResult[0].consigneeEmail,
          gstNumber: bookingResult[0].consigneeGSTnumber,
          customerRefNo: bookingResult[0].customerRefNo,
        },
        contentSpecification: bookingResult[0].contentSpecification,
        paperEnclosed: bookingResult[0].paperEnclosed,
        declaredValue: bookingResult[0].declaredValue,
        NoOfPieces: bookingResult[0].NoOfPieces,
        actualWeight: bookingResult[0].actualWeight,
        dimension: {
          exists: bookingResult[0].dimension ? true : false,
          height: bookingResult[0].dimension ? bookingResult[0].height : null,
          weight: bookingResult[0].dimension ? bookingResult[0].weight : null,
          breadth: bookingResult[0].dimension ? bookingResult[0].breadth : null,
          chargedWeight: bookingResult[0].dimension
            ? bookingResult[0].chargedWeight
            : null,
        },
        createdAt: bookingResult[0].createdAt,
      };

      return encrypt(
        {
          success: true,
          message: "Parcel booking details retrieved successfully",
          token: tokens,
          data: bookingData,
        },
        true
      );
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error("Error in viewParcelBookingV1:", errorMessage);

      return encrypt(
        {
          success: false,
          message: `Error in Parcel Booking Data retrieval: ${errorMessage}`,
          token: tokens,
        },
        true
      );
    }
  }
  public async viewPastBookingV1(userData: any, tokenData: any): Promise<any> {
    const token = { id: tokenData.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
      const ParcelBookingData = await executeQuery(parselBookingData);

      return encrypt(
        {
          success: true,
          message: "Parcel Past booking details retrieved successfully",
          token: tokens,
          data: ParcelBookingData,
        },
        true
      );
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error("Error in view Parcel Past Booking:", errorMessage);

      return encrypt(
        {
          success: false,
          message: `Error in Parcel past Booking Data retrieval: ${errorMessage}`,
          token: tokens,
        },
        true
      );
    }
  }
  public async addReportV1(userData: any, tokenData: any): Promise<any> {
    const token = { id: tokenData.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
      // Retrieve all Parcel Booking Data
      const parcelBookingData = await executeQuery(parselBookingData, []);

      // Process each entry to get refParcelBooking data based on vendorLeaf
      for (const parcel of parcelBookingData) {
        const { vendorLeaf } = parcel;

        // Retrieve related records from refParcelBooking table where vendorLeaf matches

        const refParcelBookingData = await executeQuery(
          refParcelBookingDataQuery,
          [vendorLeaf]
        );

        // Attach retrieved data to the main parcel record
        parcel.refParcelBookings = refParcelBookingData;
      }

      return encrypt(
        {
          success: true,
          message: "Report details retrieved successfully",
          token: tokens,
          data: parcelBookingData, // Each parcel contains only its relevant refParcelBookings
        },
        true
      );
    } catch (error: any) {
      console.error("Error in report:", error.message);

      return encrypt(
        {
          success: false,
          message: `Error in Parcel past Booking Data retrieval: ${error.message}`,
          token: tokens,
        },
        true
      );
    }
  }

  public async updateFinanceV1(user_data: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
      await client.query("BEGIN"); // Start Transaction

      const { refCustomerName, refPayAmount } = user_data;

      // Ensure the finance data is properly retrieved
      const financeData: any = await executeQuery(getFinanceDataQuery, [
        refCustomerName,
      ]);

      // Debugging: Log financeData to see what is returned

      // Check if financeData is valid
      if (!financeData || !financeData.rows || financeData.rows.length === 0) {
        throw new Error("Finance record not found for the given customer.");
      }

      const { refOutstandingAmt } = financeData.rows[0];
      const refBalanceAmount = refOutstandingAmt - refPayAmount;

      // Ensure refBalanceAmount does not go negative
      if (refBalanceAmount < 0) {
        throw new Error("Payment amount exceeds outstanding balance.");
      }

      const result = await client.query(updateFinanceQuery, [
        refCustomerName,
        refPayAmount,
        refBalanceAmount,
      ]);

      // Insert transaction history
      const txnHistoryParams = [
        15, // Assuming transaction type ID (adjust if needed)
        tokendata.id,
        `Outstanding Amount: ${refOutstandingAmt}, Paid Amount: ${refPayAmount}, Balance Amount: ${refBalanceAmount}`,
        CurrentTime(),
        "Admin",
      ];
      await client.query(updateHistoryQuery, txnHistoryParams);

      await client.query("COMMIT"); // Commit Transaction

      return encrypt(
        {
          success: true,
          message: "Finance details updated successfully.",
          token: tokens,
          data: result.rows[0],
        },
        true
      );
    } catch (error: any) {
      await client.query("ROLLBACK"); // Rollback Transaction in case of error

      console.error("Error during finance update:", error);

      return encrypt(
        {
          success: false,
          message: "Finance update failed",
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

  public async listFinanceV1(userData: any, tokenData: any): Promise<any> {
    const token = { id: tokenData.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
      const financeDataResult = await executeQuery(getfinanceDataQuery);
      return encrypt(
        {
          success: true,
          message: "finance data retrieved successfully",
          token: tokens,
          data: financeDataResult,
        },
        true
      );
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error("Error in finance data:", errorMessage);

      return encrypt(
        {
          success: false,
          message: `Error in finance data retrieval: ${errorMessage}`,
          token: tokens,
        },
        true
      );
    }
  }
  public async addreportDataV1(userData: any, tokenData: any): Promise<any> {
    const token = { id: tokenData.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
      const {
        refCustomerId,
        fromDate, // Start date
        toDate, // End date
      } = userData;

      const parcelBookingData = await executeQuery(getReportDataQuery, [
        refCustomerId,
        fromDate,
        toDate,
      ]);

      return encrypt(
        {
          success: true,
          message: "Report details retrieved successfully",
          token: tokens,
          data: parcelBookingData,
        },
        true
      );
    } catch (error: any) {
      console.error("Error in report:", error.message);

      return encrypt(
        {
          success: false,
          message: `Error in Parcel past Booking Data retrieval: ${error.message}`,
          token: tokens,
        },
        true
      );
    }
  }
}
