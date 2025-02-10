import { executeQuery, getClient } from "../../helper/db";
import { PoolClient } from "pg";
// import { storeFile, viewFile, deleteFile } from "../helper/storage";
import path from "path";
import { encrypt } from "../../helper/encrypt";
import { CurrentTime } from "../../helper/common";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateTokenWithExpire } from "../../helper/token";
// import { 
//  } from "./query";


export class financeRepository {
 
//   public async updatePartnersV1(userData: any, tokenData: any): Promise<any> {
//     const client: PoolClient = await getClient();
//     const token = { id: tokenData.id };
//     console.log('token', token);
//     const tokens = generateTokenWithExpire(token, true);
//     console.log('tokens', tokens);

//     try {
//       await client.query("BEGIN");
//       const { partnerName, partnerId } = userData;
//       const documentParams = [partnerName, partnerId];
//       const partnerDetails = await client.query(updatePartnerQuery, documentParams);
//       const txnHistoryParams = [
//         3,
//         tokenData.id,
//         "Update Partners",
//         CurrentTime(),
//         "vendor"
//       ];
//       const txnHistoryResult = await client.query(updateHistoryQuery, txnHistoryParams);
//       await client.query("COMMIT");
//       return encrypt(
//         {
//           success: true,
//           message: "Partner updated successfully",
//           token: tokens,
//           partnerDetails: partnerDetails,
//         },
//         false
//       );
//     } catch (error) {
//       await client.query("ROLLBACK");
//       const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
//       console.error("Error during Partner update:", error);
//       return encrypt(
//         {
//           success: false,
//           message: "Partner update failed",
//           error: errorMessage,
//           token: tokens,
//         },
//         false
//       );
//     } finally {
//       client.release();
//     }
//   }
  
}