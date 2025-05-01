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
} from "./query";
import { invoiceNumberChecking } from "../admin/query";
import axios from "axios";
import logger from "../../helper/logger";

export class bookingRepository {
  public async parcelBookingV1(userData: any, tokenData: any): Promise<any> {
    console.log("userData in repository", userData);
    const client: PoolClient = await getClient();
    const token = { id: tokenData.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
      const generateInvoiceNumber = async (prefix: any) => {
        const invoiceCheckQuery = await executeQuery(invoiceNumberChecking);
        const count = parseInt(invoiceCheckQuery[0].count) + 1;

        const baseNumber = 10000 + count;

        const currentDate = new Date();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
        const year = currentDate.getFullYear().toString().slice(-2);

        const suffix = `${month}${year}`;
        return `${prefix}${baseNumber}${suffix}`;
      };

      if (userData.vendor === "DTDC") {
        const invoiceNumber = await generateInvoiceNumber("RDTDC");

        userData.payload = {
          ...userData.payload,
          invoice_number: invoiceNumber,
        };

        console.log(
          "Updated userData with DTDC invoice number:",
          userData.payload
        );

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

        if (
          response.data.status === "OK" &&
          Array.isArray(response.data.data) &&
          response.data.data.length > 0
        ) {
          const result = response.data.data[0];

          if (result.success) {
            return encrypt(
              {
                success: true,
                message: result,
                token: tokens,
              },
              true
            );
          } else {
            console.log("Consignment API error:", result);
            return encrypt(
              {
                success: false,
                message: result,
                token: tokens,
              },
              true
            );
          }
        } else {
          console.log("DTDC API Failure:", response.data);
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

        axios
          .post(
            "https://track.delhivery.com/api/cmu/create.json",
            qs.stringify(updatedPayload),
            {
              headers: {
                Accept: "application/json",
                Authorization: "Token f4881f7518b05af9e0e3446b8b697c490dbef74f",
              },
            }
          )
          .then((res) => {
            const data = res.data;
            if (data.success && data.packages?.length > 0) {
              const pkg = data.packages[0];
              if (pkg.status === "Success" && pkg.waybill) {
                console.log("✅ Success - Waybill:", pkg.waybill);
              } else {
                console.warn(
                  "⚠️ Delhivery error:",
                  pkg.status,
                  pkg.remarks?.[0]
                );
              }
            } else {
              console.error(
                "❌ Delhivery API error:",
                data.rmk || "Unknown error"
              );
            }
          })
          .catch((err) => {
            console.error("🚫 Axios Error:", err);
          });
      } else {
        console.log("Partners name is not configured");
      }

      return encrypt(
        {
          success: true,
          message: "Parcel booking details added successfully.",
          token: tokens,
        },
        true
      );
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
