import { executeQuery, getClient } from "../../helper/db";
import { PoolClient } from "pg";
// import { storeFile, viewFile, deleteFile } from "../helper/storage";
import path from "path";
import { encrypt } from "../../helper/encrypt";
import { CurrentTime } from "../../helper/common";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateTokenWithExpire } from "../../helper/token";
import { addParcelBookingQuery, fetchParcelBookingData, updateHistoryQuery } from "./query";

export class bookingRepository {
 public async parcelBookingV1(userData: any, tokendata: any): Promise<any> {
        const client: PoolClient = await getClient();
        try {
            await client.query("BEGIN"); // Start Transaction
    
            const {
                partnersId, type, origin, destination, consignorName,
                consignorAddress, consignorGSTnumber, consignorPhone, consignorEmail,
                customerRefNo, consigneeName, consigneeAddress, consigneeGSTnumber,
                consigneePhone, consigneeEmail, contentSpecification, paperEnclosed,
                declaredValue, NoOfPieces, actualWeight, dimension,
                height, weight, breadth, chargedWeight
            } = userData;
    
            // Validate required fields
            if (!partnersId || !type || !origin || !destination || !consignorName ||
                !consignorAddress || !consignorPhone || !customerRefNo || !consigneeName ||
                !consigneeAddress || !consigneePhone || !contentSpecification || !declaredValue ||
                !NoOfPieces || !actualWeight) {
                return encrypt({ success: false, message: "Missing required fields." }, false);
            }
    
            let dimensionValues = null;
            if (dimension) {
                if (!height || !weight || !breadth || !chargedWeight) {
                    return encrypt(
                        { success: false, message: "Missing dimension details." },
                        false
                    );
                }
            }
    
            const result = await client.query(addParcelBookingQuery, [
                partnersId, type, origin, destination, consignorName,
                consignorAddress, consignorGSTnumber, consignorPhone, consignorEmail,
                customerRefNo, consigneeName, consigneeAddress, consigneeGSTnumber,
                consigneePhone, consigneeEmail, contentSpecification, paperEnclosed,
                declaredValue, NoOfPieces, actualWeight, dimension ? 1 : 0,
                dimension ? height : null, dimension ? weight : null, dimension ? breadth : null, dimension ? chargedWeight : null
            ]);
    
            // Insert transaction history
            const txnHistoryParams = [
                12, // TransTypeID
                tokendata.id, // refUserId
                "Added parcel booking details",
                CurrentTime(), // TransTime
                "admin" // UpdatedBy
            ];
            await client.query(updateHistoryQuery, txnHistoryParams);
    
            await client.query("COMMIT"); // Commit Transaction
    
            return encrypt(
                {
                    success: true,
                    message: "Parcel booking details added successfully.",
                    data: result.rows,
                },
                false
            );
        } catch (error: any) {
            await client.query("ROLLBACK"); // Rollback Transaction in case of error
    
            console.error("Error during parcel booking insertion:", error);
    
            return encrypt(
                {
                    success: false,
                    message: "Parcel booking insertion failed",
                    error: error instanceof Error ? error.message : "An unknown error occurred",
                },
                false
            );
        } finally {
            client.release(); // Release DB connection
        }
 }
 public async viewBookingV1(userData: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
        const refBookingId = userData.refBookingId;

        if (!refBookingId) {
            throw new Error("Invalid refBookingId. Cannot be null or undefined.");
        }

        const params = [refBookingId];
        const bookingResult = await executeQuery(fetchParcelBookingData, params);

        if (bookingResult.length === 0) {
            throw new Error("No parcel booking data found for the given refBookingId.");
        }

        const bookingData = {
            bookingId: bookingResult[0].bookingId,
            partnersId: bookingResult[0].partnersId,
            type: bookingResult[0].type,
            origin: bookingResult[0].origin,
            destination: bookingResult[0].destination,
            consignor: {
                name: bookingResult[0].consignorName,
                address: bookingResult[0].consignorAddress,
                phone: bookingResult[0].consignorPhone,
                email: bookingResult[0].consignorEmail,
                gstNumber: bookingResult[0].consignorGSTnumber
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
                chargedWeight: bookingResult[0].dimension ? bookingResult[0].chargedWeight : null
            },
            createdAt: bookingResult[0].createdAt
        };

        return encrypt({
            success: true,
            message: "Parcel booking details retrieved successfully",
            token: tokens,
            data: bookingData
        }, false);
    } catch (error) {
        const errorMessage = (error as Error).message;
        console.error("Error in viewParcelBookingV1:", errorMessage);
        
        return encrypt({
            success: false,
            message: `Error in Parcel Booking Data retrieval: ${errorMessage}`,
            token: tokens
        }, false);
    }
 }

}