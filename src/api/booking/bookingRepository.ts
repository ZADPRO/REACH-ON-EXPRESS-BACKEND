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
} from "./query";

export class bookingRepository {
  public async parcelBookingV1(userData: any, tokenData: any): Promise<any> {
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
          { success: false, message: "Missing required fields." },
          false
        );
      }

      // Fetch `vendorLeaf` from `transactionmapping`
      const vendorLeafResult = await client.query(vendorLeafQuery, [
        partnersName,
      ]);

      const vendorLeaf = vendorLeafResult.rows.length
        ? vendorLeafResult.rows[0].leaf
        : null;

      const refCustIdResult = await client.query(refCustIdQuery, [
        refCustomerId,
      ]);

      const refCustId = refCustIdResult.rows.length
        ? refCustIdResult.rows[0].refCustId
        : null;

      if (!vendorLeaf || !refCustId) {
        return encrypt(
          { success: false, message: "Invalid partnersId or refCustomerId." },
          false
        );
      }

      const customerTypeBoolean =
        customerType === true || customerType === "true";

      const bookedDate = new Date();

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
        true
      );
    } catch (error: any) {
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
        true
      );
    } finally {
      client.release();
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
}
