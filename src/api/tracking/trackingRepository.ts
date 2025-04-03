import { executeQuery, getClient } from "../../helper/db";
import { PoolClient } from "pg";
// import { storeFile, viewFile, deleteFile } from "../helper/storage";
import path from "path";
import { encrypt } from "../../helper/encrypt";
import { CurrentTime } from "../../helper/common";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateTokenWithExpire } from "../../helper/token";
import { GetConsignmentNumberQuery, GetReferenceNumberQuery } from "./query";
// import { 
//  } from "./query";


export class trackingRepository {
    public async trackingV1(user_data: any, tokendata: any): Promise<any> {
        const client: PoolClient = await getClient();
        const token = { id: tokendata.id };
        const tokens = generateTokenWithExpire(token, true);
    
        try {
            await client.query("BEGIN"); 
    
            let result;
            if (user_data.consignmentNumber) {
                result = await client.query(GetConsignmentNumberQuery, [user_data.consignmentNumber]);
            } else if (user_data.referenceNumber) {
                result = await client.query(GetReferenceNumberQuery, [user_data.referenceNumber]);
            } else {
                throw new Error("Either Consignment Number or Reference Number is required");
            }
    
            await client.query("COMMIT"); 
    
            return encrypt(
                {
                    success: true,
                    message: "Tracking successfully.",
                    data: result.rows,
                    token: tokens,
                },
                true
            );
        } catch (error: any) {
            await client.query("ROLLBACK");
    
            console.error("Error during tracking:", error);
    
            return encrypt(
                {
                    success: false,
                    message: "Tracking failed",
                    error: error instanceof Error ? error.message : "An unknown error occurred",
                    token: tokens,
                },
                true
            );
        } finally {
            client.release();
        }
    }
    
  
}