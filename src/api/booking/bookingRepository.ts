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
} from "./query";

export class bookingRepository {
  public async parcelBookingV1(userData: any, tokenData: any): Promise<any> {
    console.log("userData", userData);
    const client: PoolClient = await getClient();
    const token = { id: tokenData.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
      await client.query("BEGIN"); // Start Transaction

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
      } = userData;

      // Validate required fields
      if (
        !partnersName ||
        !type ||
        !origin ||
        !destination ||
        !consignorName ||
        !consignorAddress ||
        !consignorPhone ||
        !customerRefNo ||
        !consigneeName ||
        !consigneeAddress ||
        !consigneePhone ||
        !contentSpecification ||
        !declaredValue ||
        !NoOfPieces ||
        !actualWeight ||
        !paymentId ||
        !refCustomerId ||
        !netAmount ||
        !pickUP ||
        !count ||
        !consignorPincode ||
        !consigneePincode
      ) {
        return encrypt(
          {
            success: false,
            message: "Missing required fields.",
          },
          false
        );
      }

      // Fetch `vendorLeaf` from `transactionmapping`
      const vendorLeafResult = await client.query(vendorLeafQuery, [
        partnersName,
      ]);
      console.log("vendorLeafResult", vendorLeafResult);

      const vendorLeaf = vendorLeafResult.rows.length
        ? vendorLeafResult.rows[0].leaf
        : null;

      const refCustIdResult = await client.query(refCustIdQuery, [
        refCustomerId,
      ]);
      console.log("refCustIdResult", refCustIdResult);

      const refCustId = refCustIdResult.rows.length
        ? refCustIdResult.rows[0].refCustId
        : null;

      console.log("refCustId", refCustId);
      if (!vendorLeaf || !refCustId) {
        return encrypt(
          {
            success: false,
            message: "Invalid partnersId or refCustomerId.",
          },
          false
        );
      }

      const customerTypeBoolean =
        customerType === true || customerType === "true";

      console.log("customerTypeBoolean", customerTypeBoolean);
      const bookedDate = new Date();

      // Insert into `parcelBooking` table (existing logic)
      const parcelResult = await client.query(parcelBookingQuery, [
        partnersName,
        vendorLeaf,
        refCustomerId,
        refCustId,
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
        bookedDate,
        netAmount,
        pickUP,
        count,
        consignorPincode,
        consigneePincode,
      ]);

      const parcelBookingId = parcelResult.rows[0];
      console.log("parcelBookingId", parcelBookingId);

      if (!parcelBookingId) {
        throw new Error("Parcel booking insertion failed.");
      }

      // Create the prefix and date part
      const refCustIdBase = refCustId.split("-"); // Assuming refCustomerId is in the format "R-NK-10008-02-25"
      const refCustIdPrefix = refCustIdBase.slice(0, 3).join("-"); // This will be "R-NK-10008"
      const refCustIdDate = refCustIdBase.slice(3).join("-"); // This will be "02-25"

      // Now insert the same data into `refParcelBooking` table multiple times based on `count`
      if (count >= 2) {
        for (let i = 1; i <= count; i++) {
          const newRefCustId = `${refCustIdPrefix}-${String(i).padStart(
            3,
            "0"
          )}-${refCustIdDate}`; // Generating refCustId like "R-NK-10008-001-02-25"

          await client.query(refParcelBookingQuery, [
            partnersName,
            vendorLeaf,
            refCustomerId,
            newRefCustId, // Updated refCustId with increment
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
            bookedDate,
            netAmount,
            pickUP,
            count,
            consignorPincode,
            consigneePincode,
          ]);
        }
      }

      await client.query(updateRefStatusQuery, [partnersName]);

      await client.query(updateHistoryQuery, [
        12,
        tokenData.id,
        "parcel booking",
        CurrentTime(),
        "Admin",
      ]);

      await client.query("COMMIT"); // Commit Transaction

      return encrypt(
        {
          success: true,
          message: "Parcel booking details added successfully.",
          parcelBookingId: parcelBookingId,
        },
        false
      );
    } catch (error: any) {
      console.log("error", error);
      await client.query("ROLLBACK");
      return encrypt(
        {
          success: false,
          message: "Parcel booking insertion failed",
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        },
        false
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
      console.log(
        "parcelBookingId---------------------------------------------------------",
        parcelBookingId
      );

      // Validate required fields
      if (!parcelBookingId) {
        return encrypt(
          { success: false, message: "Missing parcelBookingId." },
          false
        );
      }

      const customerTypeBoolean =
        customerType === true || customerType === "true";
      console.log("isRefParcel", isRefParcel);

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
        console.log("Updated parcelBooking:", updateResult);
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
        console.log("Updated refParcelBooking:", updateResult);
      }

      await client.query("COMMIT"); // Commit transaction

      return encrypt(
        {
          success: true,
          message: "Parcel booking details updated successfully.",
        },
        false
      );
    } catch (error: any) {
      console.log("Error updating booking:", error);
      await client.query("ROLLBACK");
      return encrypt(
        {
          success: false,
          message: "Parcel booking update failed.",
          error: error.message || "An unknown error occurred",
        },
        false
      );
    } finally {
      client.release();
    }
  }
  public async paymentModeV1(user_data: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id }; // Extract token ID
    console.log("token", token);

    // Generate token with expiration
    const tokens = generateTokenWithExpire(token, true);
    console.log("tokens", tokens);

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
        false
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
        false
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
      const ParcelBookingData = await executeQuery(parselBookingData, []);

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
}
