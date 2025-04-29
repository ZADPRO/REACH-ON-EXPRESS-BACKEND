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
  getCustomerQuery,
  addFinanceQuery,
  updateFinanceQuery,
  getFinanceDataQuery,
  getParcelBookingCount,
  getfinanceDataQuery,
  getReportDataQuery,
  updateVendorLeaf,
} from "./query";

export class bookingRepository {
  // public async parcelBookingV1(userData: any, tokenData: any): Promise<any> {
  //   const client: PoolClient = await getClient();
  //   const token = { id: tokenData.id };
  //   const tokens = generateTokenWithExpire(token, true);

  //   try {
  //     await client.query("BEGIN"); // Start Transaction

  //     const {
  //       partnersName,
  //       type,
  //       origin,
  //       destination,
  //       consignorName,
  //       consignorAddress,
  //       consignorGSTnumber,
  //       consignorPhone,
  //       consignorEmail,
  //       customerRefNo,
  //       consigneeName,
  //       consigneeAddress,
  //       consigneeGSTnumber,
  //       consigneePhone,
  //       consigneeEmail,
  //       contentSpecification,
  //       paperEnclosed,
  //       declaredValue,
  //       NoOfPieces,
  //       actualWeight,
  //       dimension,
  //       height,
  //       weight,
  //       breadth,
  //       chargedWeight,
  //       paymentId,
  //       customerType,
  //       refCustomerId,
  //       netAmount,
  //       pickUP,
  //       count,
  //       consignorPincode,
  //       consigneePincode,
  //     } = userData;

  //     // Validate required fields
  //     if (
  //       !partnersName ||
  //       !type ||
  //       !origin ||
  //       !destination ||
  //       !consignorName ||
  //       !consignorAddress ||
  //       !consignorPhone ||
  //       !customerRefNo ||
  //       !consigneeName ||
  //       !consigneeAddress ||
  //       !consigneePhone ||
  //       !contentSpecification ||
  //       !declaredValue ||
  //       !NoOfPieces ||
  //       !actualWeight ||
  //       !paymentId ||
  //       !refCustomerId ||
  //       !netAmount ||
  //       !pickUP ||
  //       !count ||
  //       !consignorPincode ||
  //       !consigneePincode
  //     ) {
  //       return encrypt(
  //         {
  //           success: false,
  //           message: "Missing required fields.",
  //         },
  //         false
  //       );
  //     }

  //     // Fetch `vendorLeaf` from `transactionmapping`
  //     const vendorLeafResult = await client.query(vendorLeafQuery, [
  //       partnersName,
  //     ]);

  //     const vendorLeaf = vendorLeafResult.rows.length
  //       ? vendorLeafResult.rows[0].leaf
  //       : null;

  //     const refCustIdResult = await client.query(refCustIdQuery, [
  //       refCustomerId,
  //     ]);

  //     const refCustId = refCustIdResult.rows.length
  //       ? refCustIdResult.rows[0].refCustId
  //       : null;

  //     // if (!vendorLeaf || !refCustId) {
  //     //   return encrypt(
  //     //     {
  //     //       success: false,
  //     //       message: "Invalid partnersId or refCustomerId.",
  //     //     },
  //     //     false
  //     //   );
  //     // }

  //     const customerTypeBoolean =
  //       customerType === true || customerType === "true";

  //     const bookedDate = new Date();

  //     // Insert into `parcelBooking` table (existing logic)
  //     // const parcelResult = await client.query(parcelBookingQuery, [
  //     //   partnersName,
  //     //   vendorLeaf,
  //     //   refCustomerId,
  //     //   refCustId,
  //     //   customerTypeBoolean,
  //     //   paymentId,
  //     //   type,
  //     //   origin,
  //     //   destination,
  //     //   consignorName,
  //     //   consignorAddress,
  //     //   consignorGSTnumber,
  //     //   consignorPhone,
  //     //   consignorEmail,
  //     //   customerRefNo,
  //     //   consigneeName,
  //     //   consigneeAddress,
  //     //   consigneeGSTnumber,
  //     //   consigneePhone,
  //     //   consigneeEmail,
  //     //   contentSpecification,
  //     //   paperEnclosed,
  //     //   declaredValue,
  //     //   NoOfPieces,
  //     //   actualWeight,
  //     //   dimension ? 1 : 0,
  //     //   dimension ? height : null,
  //     //   dimension ? weight : null,
  //     //   dimension ? breadth : null,
  //     //   dimension ? chargedWeight : null,
  //     //   bookedDate,
  //     //   netAmount,
  //     //   pickUP,
  //     //   count,
  //     //   consignorPincode,
  //     //   consigneePincode,
  //     // ]);

  //     // const parcelBookingId = parcelResult.rows[0];

  //     // if (!parcelBookingId) {
  //     //   throw new Error("Parcel booking insertion failed.");
  //     // }

  //     // Create the prefix and date part
  //     const refCustIdBase = refCustId.split("-"); // Assuming refCustomerId is in the format "R-NK-10008-02-25"
  //     const refCustIdPrefix = refCustIdBase.slice(0, 3).join("-"); // This will be "R-NK-10008"
  //     const refCustIdDate = refCustIdBase.slice(3).join("-"); // This will be "02-25"

  //     // Now insert the same data into `refParcelBooking` table multiple times based on `count`
  //     if (count >= 2) {
  //       for (let i = 1; i <= count; i++) {
  //         const newRefCustId = `${refCustIdPrefix}-${String(i).padStart(
  //           3,
  //           "0"
  //         )}-${refCustIdDate}`; // Generating refCustId like "R-NK-10008-001-02-25"

  //         const parcelResult = await client.query(refParcelBookingQuery, [
  //           partnersName,
  //           vendorLeaf,
  //           refCustomerId,
  //           newRefCustId, // Updated refCustId with increment
  //           customerTypeBoolean,
  //           paymentId,
  //           type,
  //           origin,
  //           destination,
  //           consignorName,
  //           consignorAddress,
  //           consignorGSTnumber,
  //           consignorPhone,
  //           consignorEmail,
  //           customerRefNo,
  //           consigneeName,
  //           consigneeAddress,
  //           consigneeGSTnumber,
  //           consigneePhone,
  //           consigneeEmail,
  //           contentSpecification,
  //           paperEnclosed,
  //           declaredValue,
  //           NoOfPieces,
  //           actualWeight,
  //           dimension ? 1 : 0,
  //           dimension ? height : null,
  //           dimension ? weight : null,
  //           dimension ? breadth : null,
  //           dimension ? chargedWeight : null,
  //           bookedDate,
  //           netAmount,
  //           pickUP,
  //           count,
  //           consignorPincode,
  //           consigneePincode,
  //         ]);
  //         const parcelBookingId = parcelResult.rows[0];

  //     if (!parcelBookingId) {
  //       throw new Error("Parcel booking insertion failed.");
  //     }
  //     await client.query(updateRefStatusQuery, [partnersName]);
  //     console.log('parcelBookingId', parcelBookingId)
  //   }

  // }
  // await client.query(updateHistoryQuery, [
  //       12,
  //       tokenData.id,
  //       "parcel booking",
  //       CurrentTime(),
  //       "Admin",
  //     ]);

  //     await client.query("COMMIT"); // Commit Transaction

  //     return encrypt(
  //       {
  //         success: true,
  //         message: "Parcel booking details added successfully.",
  //         parcelBookingId: parcelBookingId,
  //       },
  //       false
  //     );
  //   } catch (error: any) {
  //     console.log("error", error);
  //     await client.query("ROLLBACK");
  //     return encrypt(
  //       {
  //         success: false,
  //         error:
  //           error instanceof Error
  //             ? error.message
  //             : "An unknown error occurred",
  //       },
  //       false
  //     );
  //   } finally {
  //     client.release();
  //   }
  // }
  public async parcelBookingV1(userData: any, tokenData: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokenData.id };
    const tokens = generateTokenWithExpire(token, true);
    let parcelBookingId: any = null;

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
        leaf,
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
        Count,
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
        !consignorPincode ||
        !consigneePincode
      ) {
        throw new Error("Missing required fields.");
      }

      // Fetch `vendorLeaf` from `transactionmapping`
      const vendorLeaf = leaf;

      const updateVendorLeafQuery = await client.query(updateVendorLeaf, [
        leaf,
      ]);
      console.log("updateVendorLeafQuery", updateVendorLeafQuery);

      const refCustIdResult = await client.query(refCustIdQuery, [
        refCustomerId,
      ]);
      console.log("refCustIdResult line 368", refCustIdResult);
      const refCustId = refCustIdResult.rows.length
        ? refCustIdResult.rows[0].refCustId
        : null;

      if (!refCustId) {
        throw new Error("Invalid partnersId or refCustomerId.");
      }

      const customerTypeBoolean =
        customerType === true || customerType === "true";
      const bookedDate = new Date();

      if (!refCustId || typeof refCustId !== "string") {
        throw new Error("Invalid refCustomerId format.");
      }

      const refCustIdBase = refCustId.split("-");
      const refCustIdPrefix = refCustIdBase.slice(0, 3).join("-");
      const refCustIdDate = refCustIdBase.slice(3).join("-");

      // Fetch existing count of refParcelBookingId for refCustomerId
      const countResult = await client.query(getParcelBookingCount, [
        refCustomerId,
      ]);

      let currentCount = parseInt(countResult.rows[0]?.total || "0", 10);
      currentCount++; // Increment count for new entry
      console.log("currentCount", currentCount);

      const newRefCustId = `${refCustIdPrefix}-${String(currentCount).padStart(
        3,
        "0"
      )}-${refCustIdDate}`;

      console.log(`Inserting refParcelBooking with refCustId: ${newRefCustId}`);

      // Insert into `refParcelBooking`
      const parcelResult = await client.query(refParcelBookingQuery, [
        partnersName,
        vendorLeaf,
        refCustomerId,
        newRefCustId,
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
        Count,
        consignorPincode,
        consigneePincode,
        CurrentTime(),
        "Admin",
      ]);

      console.log("parcelResult", parcelResult);
      if (parcelResult.rows.length > 0) {
        parcelBookingId = parcelResult.rows[0];
      } else {
        throw new Error("Parcel booking insertion returned no rows.");
      }

      // Update reference status
      await client.query(updateRefStatusQuery, [partnersName]);

      // Fetch customer details
      const customerResult = await client.query(getCustomerQuery, [
        refCustomerId,
      ]);
      console.log("customerResult", customerResult);
      if (customerResult.rows.length === 0)
        throw new Error("Customer not found.");
      const { refCustomerName } = customerResult.rows[0];

      // Add finance entry if applicable
      if (customerTypeBoolean && paymentId === 4) {
        await client.query(addFinanceQuery, [
          refCustomerName,
          netAmount,
          netAmount,
        ]);
      }

      // Insert transaction history
      await client.query(updateHistoryQuery, [
        12,
        tokenData.id,
        `Parcel Booking: 1 record inserted with refCustId ${newRefCustId}`,
        CurrentTime(),
        "Admin",
      ]);

      await client.query("COMMIT"); // Commit Transaction

      return encrypt(
        {
          success: true,
          message: "Parcel booking details added successfully.",
          parcelBookingId: parcelBookingId,
          token: tokens,
        },
        true
      );
    } catch (error: any) {
      console.error("Transaction error:", error);
      await client.query("ROLLBACK");
      return encrypt(
        {
          success: false,
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

  // public async parcelBookingV1(userData: any, tokenData: any): Promise<any> {
  //   const client: PoolClient = await getClient();
  //   const token = { id: tokenData.id };
  //   const tokens = generateTokenWithExpire(token, true);
  //   let parcelBookingId: any = null;

  //   try {
  //     await client.query("BEGIN"); // Start Transaction

  //     const {
  //       partnersName,
  //       type,
  //       origin,
  //       destination,
  //       consignorName,
  //       consignorAddress,
  //       consignorGSTnumber,
  //       consignorPhone,
  //       consignorEmail,
  //       customerRefNo,
  //       consigneeName,
  //       consigneeAddress,
  //       consigneeGSTnumber,
  //       consigneePhone,
  //       consigneeEmail,
  //       contentSpecification,
  //       paperEnclosed,
  //       declaredValue,
  //       NoOfPieces,
  //       actualWeight,
  //       dimension,
  //       height,
  //       weight,
  //       breadth,
  //       chargedWeight,
  //       paymentId,
  //       customerType,
  //       refCustomerId,
  //       netAmount,
  //       pickUP,
  //       count,
  //       consignorPincode,
  //       consigneePincode,
  //     } = userData;

  //     // Validate required fields
  //     if (
  //       !partnersName ||
  //       !type ||
  //       !origin ||
  //       !destination ||
  //       !consignorName ||
  //       !consignorAddress ||
  //       !consignorPhone ||
  //       !customerRefNo ||
  //       !consigneeName ||
  //       !consigneeAddress ||
  //       !consigneePhone ||
  //       !contentSpecification ||
  //       !declaredValue ||
  //       !NoOfPieces ||
  //       !actualWeight ||
  //       !paymentId ||
  //       !refCustomerId ||
  //       !netAmount ||
  //       !pickUP ||
  //       !count ||
  //       !consignorPincode ||
  //       !consigneePincode
  //     ) {
  //       throw new Error("Missing required fields.");
  //     }

  //     // Fetch `vendorLeaf` from `transactionmapping`
  //     const vendorLeafResult = await client.query(vendorLeafQuery, [
  //       partnersName,
  //     ]);
  //     const vendorLeaf = vendorLeafResult.rows.length
  //       ? vendorLeafResult.rows[0].leaf
  //       : null;

  //     console.log("vendorLeaf------------------------------------------------------------------------363", vendorLeaf);
  //     const refCustIdResult = await client.query(refCustIdQuery, [
  //       refCustomerId,
  //     ]);

  //     const refCustId = refCustIdResult.rows.length
  //       ? refCustIdResult.rows[0].refCustId
  //       : null;
  //     console.log("refCustId---------------------------------------------------------------------------371", refCustId);

  //     if (!vendorLeaf|| !refCustId ) {

  //       throw new Error("Invalid partnersId or refCustomerId.");
  //     }

  //     const customerTypeBoolean =
  //       customerType === true || customerType === "true";
  //     const bookedDate = new Date();

  //     // Ensure refCustomerId format is correct before splitting
  //     if (!refCustId || typeof refCustId !== "string") {
  //       throw new Error("Invalid refCustomerId format.");
  //     }
  //     const refCustIdBase = refCustId.split("-");
  //     const refCustIdPrefix = refCustIdBase.slice(0, 3).join("-");
  //     const refCustIdDate = refCustIdBase.slice(3).join("-");

  //     // Insert into `refParcelBooking` table multiple times based on `count`
  //     for (let i = 1; i <= count; i++) {
  //       const newRefCustId = `${refCustIdPrefix}-${String(i).padStart(
  //         3,
  //         "0"
  //       )}-${refCustIdDate}`;
  //       console.log(
  //         `Inserting refParcelBooking with refCustId: ${newRefCustId}`
  //       );

  //       try {
  //         const parcelResult = await client.query(refParcelBookingQuery, [
  //           partnersName,
  //           vendorLeaf,
  //           refCustomerId,
  //           newRefCustId,
  //           customerTypeBoolean,
  //           paymentId,
  //           type,
  //           origin,
  //           destination,
  //           consignorName,
  //           consignorAddress,
  //           consignorGSTnumber,
  //           consignorPhone,
  //           consignorEmail,
  //           customerRefNo,
  //           consigneeName,
  //           consigneeAddress,
  //           consigneeGSTnumber,
  //           consigneePhone,
  //           consigneeEmail,
  //           contentSpecification,
  //           paperEnclosed,
  //           declaredValue,
  //           NoOfPieces,
  //           actualWeight,
  //           dimension ? 1 : 0,
  //           dimension ? height : null,
  //           dimension ? weight : null,
  //           dimension ? breadth : null,
  //           dimension ? chargedWeight : null,
  //           bookedDate,
  //           netAmount,
  //           pickUP,
  //           count,
  //           consignorPincode,
  //           consigneePincode,
  //         ]);

  //         if (parcelResult.rows.length > 0) {
  //           parcelBookingId = parcelResult.rows[0];
  //         } else {
  //           throw new Error("Parcel booking insertion returned no rows.");
  //         }

  //         await client.query(updateRefStatusQuery, [partnersName]);

  //         const customer = await client.query(getCustomerQuery, [refCustomerId]);
  //         console.log('customer', customer)

  //         const { refCustomerName } = customer.rows[0];

  //         if (customerTypeBoolean && paymentId === 4) {
  //           //  if (customerType===true && paymentId === 4)

  //           await client.query(addFinanceQuery, [
  //             refCustomerName,
  //             netAmount,
  //             netAmount,
  //           ]);
  //         }
  //        const updateHistory =  await client.query(updateHistoryQuery, [
  //          12,
  //          tokenData.id,
  //          "parcel booking",
  //          CurrentTime(),
  //          "Admin",
  //         ]);
  //         console.log('updateHistory', updateHistory)
  //         await client.query("COMMIT"); // Commit Transaction
  //       } catch (error) {
  //         console.error("Error inserting into refParcelBooking:", error);
  //         throw error;
  //       }
  //     }

  //     // await client.query(updateRefStatusQuery, [partnersName]);

  //     // const customer = await client.query(getCustomerQuery, [refCustomerId]);

  //     // const { refCustomerName } = customer.rows[0];

  //     // if (customerTypeBoolean && paymentId === 4) {
  //     //   //  if (customerType===true && paymentId === 4)

  //     //   await client.query(addFinanceQuery, [
  //     //     refCustomerName,
  //     //     netAmount,
  //     //     netAmount,
  //     //   ]);
  //     // }
  //     // await client.query(updateHistoryQuery, [
  //     //   12,
  //     //   tokenData.id,
  //     //   "parcel booking",
  //     //   CurrentTime(),
  //     //   "Admin",
  //     // ]);
  //     // await client.query("COMMIT"); // Commit Transaction

  //     return encrypt(
  //       {
  //         success: true,
  //         message: "Parcel booking details added successfully.",
  //         parcelBookingId: parcelBookingId,
  //       },
  //       false
  //     );
  //   } catch (error: any) {
  //     console.error("Transaction error:", error);
  //     await client.query("ROLLBACK");
  //     return encrypt(
  //       {
  //         success: false,
  //         error:
  //           error instanceof Error
  //             ? error.message
  //             : "An unknown error occurred",
  //       },
  //       false
  //     );
  //   } finally {
  //     client.release();
  //   }
  // }
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
  // public async updateFinanceV1(user_data: any, tokendata: any): Promise<any> {
  //   const client: PoolClient = await getClient();
  //   const token = { id: tokendata.id };
  //   const tokens = generateTokenWithExpire(token, true);

  //   try {
  //     await client.query("BEGIN"); // Start Transaction

  //     const { refCustomerName, refPayAmount } = user_data;

  //     const financeData: any = executeQuery(getFinanceDataQuery, [
  //       refCustomerName,
  //     ]);
  //     const { refOutstandingAmt } = financeData.rows[0];

  //     const refBalanceAmount = refOutstandingAmt - refPayAmount;

  //     const result = await client.query(updateFinanceQuery, [
  //       refCustomerName,
  //       refPayAmount,
  //       refBalanceAmount,
  //     ]);

  //     // const txnHistoryParams = [
  //     //   ,
  //     //   tokendata.id,
  //     //   "amount",
  //     //   CurrentTime(),
  //     //   "admin",
  //     // ];
  //     // await client.query(updateHistoryQuery, txnHistoryParams);

  //     const txnHistoryParams = [
  //       tokendata.id,
  //       `Outstanding Amount: ${refOutstandingAmt}, PayAmount: ${refPayAmount}, Balance Amount: ${refBalanceAmount}`,
  //       CurrentTime(),
  //       "admin",
  //     ];

  //     await client.query("COMMIT"); // Commit Transaction

  //     return encrypt(
  //       {
  //         success: true,
  //         message: "Partner inserted successfully.",
  //         token: tokens,

  //         data: result,
  //       },
  //       true
  //     );
  //   } catch (error: any) {
  //     await client.query("ROLLBACK"); // Rollback Transaction in case of error

  //     console.error("Error during Partner insertion:", error);

  //     return encrypt(
  //       {
  //         success: false,
  //         message: "Partner insertion failed",
  //         error:
  //           error instanceof Error
  //             ? error.message
  //             : "An unknown error occurred",
  //         token: tokens,
  //       },
  //       true
  //     );
  //   } finally {
  //     client.release(); // Release DB connection
  //   }
  // }
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
      console.log("Finance Data:", financeData);

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

  //   public async updateFinanceV1(user_data: any, tokendata: any): Promise<any> {
  //     const client: PoolClient = await getClient();
  //     const token = { id: tokendata.id };
  //     const tokens = generateTokenWithExpire(token, true);

  //     try {
  //         await client.query("BEGIN"); // Start Transaction

  //         const { refCustomerName, refPayAmount } = user_data;

  //         // Ensure the finance data is properly retrieved
  //         const financeData:any = await executeQuery(getFinanceDataQuery, [refCustomerName]);

  //         // if (!financeData.rows.length) {
  //         //     throw new Error("Finance record not found for the given customer.");
  //         // }

  //         const { refOutstandingAmt } = financeData.rows[0];
  //         const refBalanceAmount = refOutstandingAmt - refPayAmount;

  //         // Ensure refBalanceAmount does not go negative
  //         if (refBalanceAmount < 0) {
  //             throw new Error("Payment amount exceeds outstanding balance.");
  //         }

  //         const result = await client.query(updateFinanceQuery, [
  //             refCustomerName,
  //             refPayAmount,
  //             refBalanceAmount,
  //         ]);

  //         // Insert transaction history
  //         const txnHistoryParams = [
  //             15, // Assuming transaction type ID (adjust if needed)
  //             tokendata.id,
  //             `Outstanding Amount: ${refOutstandingAmt}, Paid Amount: ${refPayAmount}, Balance Amount: ${refBalanceAmount}`,
  //             CurrentTime(),
  //             "Admin",
  //         ];
  //         await client.query(updateHistoryQuery, txnHistoryParams);

  //         await client.query("COMMIT"); // Commit Transaction

  //         return encrypt(
  //             {
  //                 success: true,
  //                 message: "Finance details updated successfully.",
  //                 token: tokens,
  //                 data: result.rows[0],
  //             },
  //             true
  //         );
  //     } catch (error: any) {
  //         await client.query("ROLLBACK"); // Rollback Transaction in case of error

  //         console.error("Error during finance update:", error);

  //         return encrypt(
  //             {
  //                 success: false,
  //                 message: "Finance update failed",
  //                 error: error instanceof Error ? error.message : "An unknown error occurred",
  //                 token: tokens,
  //             },
  //             true
  //         );
  //     } finally {
  //         client.release(); // Release DB connection
  //     }
  // }
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
