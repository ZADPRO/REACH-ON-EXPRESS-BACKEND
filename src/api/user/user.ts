import { executeQuery, getClient } from "../../helper/db";
import { PoolClient } from "pg";
import { encrypt } from "../../helper/encrypt";
import { CurrentTime } from "../../helper/common";
import bcrypt from "bcryptjs";
import { generateTokenWithExpire } from "../../helper/token";
import { UserLoginQuery } from "./query";
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
}
