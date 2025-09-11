import { executeQuery, getClient } from "../../helper/db";
import { PoolClient } from "pg";
import { encrypt } from "../../helper/encrypt";
import { CurrentTime } from "../../helper/common";
import bcrypt from "bcryptjs";
import { generateTokenWithExpire } from "../../helper/token";
import {
  parcelDetailsPaginated,
  userDetailsQuery,
  UserLoginQuery,
} from "./query";
import { updateHistoryQuery } from "../admin/query";

export class UserRepo {
  public async userLoginV1(user_data: any, tokenData: any): Promise<any> {
    const client: PoolClient = await getClient();

    try {
      await client.query("BEGIN");

      // Fetch user details using refPhone (username)
      const queryResult = await client.query(UserLoginQuery, [
        user_data.username,
      ]);
      console.log("queryResult", queryResult);

      if (!queryResult.rows.length) {
        // Check if rows array is empty
        await client.query("ROLLBACK");
        return encrypt(
          {
            success: false,
            message: "No data found for the given username",
          },
          true
        );
      }

      const userDetails = queryResult.rows[0];
      console.log("userDetails", userDetails);
      const tokenData = { id: userDetails.refCustomerId };

      if (
        user_data.username !== userDetails.refPhone &&
        user_data.password !== userDetails.refPhone
      ) {
        // If both username and password match the refPhone, proceed
        await client.query("ROLLBACK");
        return encrypt(
          {
            success: false,
            message: "Incorrect password",
            token: generateTokenWithExpire({ id: tokenData.id }, true),
          },
          true
        );
      }

      // Insert transaction history
      const txnHistoryParams = [
        30, // TransTypeID
        tokenData.id, // refUserId (Modify as needed)
        "Fetch Report Data",
        CurrentTime(), // TransTime
        "admin", // UpdatedBy (Modify based on logged-in user)
      ];
      await client.query(updateHistoryQuery, txnHistoryParams);

      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message: "User Login Successfully",
          userDetails: userDetails,
          token: generateTokenWithExpire(tokenData, true),
        },
        true
      );
    } catch (error: any) {
      await client.query("ROLLBACK");

      console.error("Error during login:", error);

      return encrypt(
        {
          success: false,
          message: "Login failed",
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
          token: generateTokenWithExpire({ id: tokenData.id }, true),
        },
        true
      );
    } finally {
      client.release();
    }
  }

  public async userParcelDetailsV1(
    user_data: any,
    tokenData: any
  ): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokenData.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
      const getUserDetails = await executeQuery(userDetailsQuery, [token.id]);
      const refCode = getUserDetails?.[0]?.refCode;

      if (!refCode) throw new Error("refCode not found for this user.");

      const { page = 1, limit = 50, search = "" } = user_data;
      const offset = (page - 1) * limit;

      const userParcelData = await executeQuery(parcelDetailsPaginated, [
        refCode,
        limit,
        offset,
        search,
      ]);

      return encrypt(
        {
          success: true,
          message: "User Parcel Details Sent Successfully",
          token: tokens,
          userParcelData,
        },
        true
      );
    } catch (error: any) {
      await client.query("ROLLBACK");
      return encrypt(
        {
          success: false,
          message: error.message ?? "Login failed",
          token: generateTokenWithExpire({ id: tokenData.id }, true),
        },
        true
      );
    } finally {
      client.release();
    }
  }

  public async raiseRequestV1(user_data: any, tokenData: any): Promise<any> {
    console.log("user_data", user_data);
    const client: PoolClient = await getClient();

    try {
      await client.query("BEGIN");

      // 1️⃣ Insert into raiseRequest table
      const insertRequestQuery = `
      INSERT INTO public."raiseRequest"
        ("senderName", "senderId", "senderMobile",
         "receiverName", "receiverMobile", "receiverPincode",
         "parcelDetails", "boxCount", "weight", "specifications",
         "createdAt", "createdBy", "isDelete", "isAccepted", "latestStatus")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING "reqId";
    `;

      const insertRequestParams = [
        user_data.senderName,
        user_data.senderId,
        user_data.senderMobile,
        user_data.receiverName,
        user_data.receiverMobile,
        user_data.receiverPincode,
        user_data.parcelDetails,
        user_data.boxCount,
        user_data.weight,
        user_data.specifications,
        user_data.createdAt || CurrentTime(),
        user_data.createdBy || tokenData?.id || "System",
        user_data.isDelete === "false" ? false : !!user_data.isDelete,
        user_data.isAccepted === "false" ? false : !!user_data.isAccepted,
        user_data.latestStatus || "Request Raised",
      ];

      const reqResult = await client.query(
        insertRequestQuery,
        insertRequestParams
      );
      const reqId = reqResult.rows[0].reqId;

      // 2️⃣ Insert into transaction history
      const txnHistoryParams = [
        30, // TransTypeID
        tokenData?.id || user_data.senderId, // refUserId
        `Request Created: ${reqId}`,
        CurrentTime(),
        "User", // UpdatedBy
      ];
      console.log("txnHistoryParams", txnHistoryParams);
      await client.query(updateHistoryQuery, txnHistoryParams);

      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message: "Request Raised Successfully",
          reqId,
        },
        true
      );
    } catch (error: any) {
      await client.query("ROLLBACK");

      console.error("Error during request creation:", error);

      return encrypt(
        {
          success: false,
          message: "Request Creation failed",
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
          token: generateTokenWithExpire({ id: tokenData?.id }, true),
        },
        true
      );
    } finally {
      client.release();
    }
  }

  public async getAllRequestV1(user_data: any, tokenData: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokenData.id };
    console.log("token", token.id);
    const tokens = generateTokenWithExpire(token, true);

    try {
      // Fetch all requests where isDelete = false
      const query = `
      SELECT * 
      FROM public."raiseRequest" rr
      WHERE rr."isDelete" = false
      AND rr."createdBy" = $1
      ORDER BY rr."reqId" ASC;
      `;
      console.log("query", query);
      const result = await client.query(query, [token.id]);
      console.log("result", result.rows);

      return encrypt(
        {
          success: true,
          message: "User Request Details Sent Successfully",
          data: result.rows, // sending request data
          token: tokens,
        },
        true
      );
    } catch (error: any) {
      await client.query("ROLLBACK");
      console.error("Error during req:", error);

      return encrypt(
        {
          success: false,
          message: "Request fetch failed",
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
          token: generateTokenWithExpire({ id: tokenData.id }, true),
        },
        true
      );
    } finally {
      client.release();
    }
  }

  public async getAllRequestIdV1(user_data: any, tokenData: any): Promise<any> {
    console.log("tokenData", tokenData);
    const client: PoolClient = await getClient();
    const token = { id: tokenData.id };
    console.log("token", token.id);
    const tokens = generateTokenWithExpire(token, true);

    try {
      // Fetch all requests where isDelete = false
      const query = `
      SELECT * 
      FROM public."raiseRequest" rr
      WHERE rr."isDelete" = false
      AND rr."createdBy" = $1
      ORDER BY rr."reqId" ASC;
    `;
      const result = await client.query(query, [token.id]);

      return encrypt(
        {
          success: true,
          message: "User Request Details Sent Successfully",
          data: result.rows, // sending request data
          token: tokens,
        },
        true
      );
    } catch (error: any) {
      await client.query("ROLLBACK");
      console.error("Error during req:", error);

      return encrypt(
        {
          success: false,
          message: "Request fetch failed",
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
          token: generateTokenWithExpire({ id: tokenData.id }, true),
        },
        true
      );
    } finally {
      client.release();
    }
  }

  public async raiseComplaintV1(user_data: any, tokenData: any): Promise<any> {
    console.log("tokenData", tokenData);
    console.log("user_data", user_data);
    const client: PoolClient = await getClient();

    try {
      await client.query("BEGIN");

      // 1️⃣ Insert into raiseComplaint table
      const insertComplaintQuery = `
      INSERT INTO public."raiseComplaint"
        ("refReqId", "complaintType", "Description", "createdAt", "createdBy", "isDelete")
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id;
    `;

      const insertComplaintParams = [
        user_data.BookingId, // refReqId
        user_data.complaintType, // complaintType
        user_data.description, // Description
        user_data.createdAt || CurrentTime(), // createdAt
        user_data.createdBy || tokenData?.id || "System", // createdBy
        false, // isDelete default
      ];

      console.log("insertComplaintParams", insertComplaintParams);
      const complaintResult = await client.query(
        insertComplaintQuery,
        insertComplaintParams
      );
      const complaintId = complaintResult.rows[0].id;
      console.log("complaintId", complaintId);

      // 2️⃣ Insert into transaction history
      const txnHistoryParams = [
        40, // TransTypeID → give a new ID for complaint logs
        tokenData?.id || user_data.createdBy, // refUserId
        `Complaint Raised: ${complaintId} for Request ${user_data.BookingId}`,
        CurrentTime(),
        "User", // UpdatedBy
      ];
      console.log("txnHistoryParams", txnHistoryParams);
      await client.query(updateHistoryQuery, txnHistoryParams);

      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message: "Complaint Raised Successfully",
          complaintId,
        },
        true
      );
    } catch (error: any) {
      await client.query("ROLLBACK");

      console.error("Error during complaint creation:", error);

      return encrypt(
        {
          success: false,
          message: "Complaint Creation failed",
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
          token: generateTokenWithExpire({ id: tokenData?.id }, true),
        },
        true
      );
    } finally {
      client.release();
    }
  }

  public async getAllComplaintsV1(
    user_data: any,
    tokenData: any
  ): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokenData.id };
    console.log("token", token.id);
    const tokens = generateTokenWithExpire(token, true);

    try {
      const query = `
      SELECT
        *
      FROM
        public."raiseComplaint" rc
        JOIN public."raiseRequest" rr ON rr."reqId" = rc."refReqId"
      WHERE
        rc."isDelete" = false
        AND rc."createdBy" = $1
      ORDER BY
        rc.id ASC;
      `;
      console.log("query", query);
      const result = await client.query(query, [token.id]);
      console.log("result", result.rows);

      return encrypt(
        {
          success: true,
          message: "User Request Details Sent Successfully",
          data: result.rows, // sending request data
          token: tokens,
        },
        true
      );
    } catch (error: any) {
      await client.query("ROLLBACK");
      console.error("Error during req:", error);

      return encrypt(
        {
          success: false,
          message: "Request fetch failed",
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
          token: generateTokenWithExpire({ id: tokenData.id }, true),
        },
        true
      );
    } finally {
      client.release();
    }
  }
}
