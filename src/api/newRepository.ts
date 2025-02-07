import { executeQuery, getClient } from "../helper/db";
import { PoolClient } from "pg";
// import { storeFile, viewFile, deleteFile } from "../helper/storage";
import path from "path";
import { encrypt } from "../helper/encrypt";
import { CurrentTime } from "../helper/common";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateTokenWithExpire } from "../helper/token";
import { 
  selectUserByLogin, checkQuery, insertUserQuery, insertUserDomainQuery, insertUserCommunicationQuery,
  addPartnerQuery, addVendorQuery, deletePartnerQuery, deleteVendorQuery, getPartnerQuery, getVendorQuery, updateHistoryQuery, updatePartnerQuery, updateVendorQuery       
 } from "./query";

export class newRepository {
 public async userSignUpV1(userData: any, token_data?: any): Promise<any> {
    const client: PoolClient = await getClient();
    try {
      await client.query('BEGIN');

      const hashedPassword = await bcrypt.hash(userData.temp_password, 10);

      const check = [userData.temp_username];
      console.log(check);

      const userCheck = await client.query(checkQuery, check);
      console.log('userCheck', userCheck);

      const userFind = userCheck.rows[0];
      console.log('userFind', userFind);

      if (userFind) {
        await client.query('ROLLBACK');
        return encrypt(
          {
            message: "Already exists",
            success: true,
          },
          false
        );
      }
      const params = [
        userData.temp_fname, // refStFName
        userData.temp_lname, // refStLName
      ];
      console.log(params);
      const userResult = await client.query(insertUserQuery, params);
      const newUser = userResult.rows[0];
      console.log('newUser', newUser);

      const domainParams = [
        newUser.refUserId, // refUserId from users table
        userData.temp_phone,
        userData.temp_password, // refCustPassword
        hashedPassword, // refCustHashedPassword
        userData.temp_username, // refcust Username
      ];
      console.log(domainParams);
      const domainResult = await client.query(insertUserDomainQuery, domainParams);
      const communicationParams = [
        newUser.refUserId, // refUserId from user table
        userData.temp_phone,
        userData.temp_email,
      ];
      console.log(communicationParams);

      const communicationResult = await client.query(insertUserCommunicationQuery, communicationParams);

      if (
        userResult.rows.length > 0 &&
        domainResult.rows.length > 0 &&
        communicationResult.rows.length > 0
      ) {
        const history = [
          8,
          newUser.refUserId,
          "User SignUp",
          CurrentTime(),
          "user"
        ];

        console.log('history', history);
        const updateHistory = await client.query(updateHistoryQuery, history);


        console.log("---><---",updateHistory.rows);
        

        if (updateHistory.rows.length > 0) {
          const tokenData = {
           
            id: newUser.refUserId, // refUserId from users table
            email: userData.temp_su_email,
            // custId: newUser.refSCustId,
            // status: newUser.refSUserStatus,
          };
          console.log('tokenData----------------------------', tokenData)
          await client.query('COMMIT');  // Commit the transaction
          return encrypt(
            {
              success: true,
              message: "User signup successful",
              user: newUser,
              token: generateTokenWithExpire(tokenData, true),
            },
            false
          );
        } else {
          await client.query('ROLLBACK');  // Rollback if history update fails
          return encrypt(
            {
              success: false,
              message: "Failed to update history",
            },
            false
          );
        }
      } else {
        await client.query('ROLLBACK');  // Rollback if any insert fails
        return encrypt(
          {
            success: false,
            message: "Signup failed",
          },
          false
        );
      }
    } catch (error: unknown) {
      await client.query('ROLLBACK');  // Rollback the transaction in case of any error
      console.error('Error during user signup:', error);

      if (error instanceof Error) {
        return encrypt(
          {
            success: false,
            message: "An unexpected error occurred during signup",
            error: error.message,
          },
          false
        );
      } else {
        return encrypt(
          {
            success: false,
            message: "An unknown error occurred during signup",
            error: String(error),
          },
          true
        );
      }
    } finally {
      client.release();  // Release the client back to the pool
    }
  }
 public async adminloginV1(user_data: any, domain_code?: any): Promise<any> {
    try {
      const params = [user_data.login];
      const users = await executeQuery(selectUserByLogin, params);

      if (users.length > 0) {
        const user = users[0];
        console.log('user', user)

        // Verify the password
        console.log('user_data.password line ---- 22', user_data.password)
        console.log('user.refCustHashedPassword line ----', user.refCusthashedpassword)
        const validPassword = await bcrypt.compare(user_data.password, user.refCusthashedpassword);
        if (validPassword) {
          const history = [1, user.refUserId, "Login", CurrentTime(), "Admin"];
          const updateHistory = await executeQuery(updateHistoryQuery, history);

          if (updateHistory) {
            const tokenData = { id: user.refUserId };
            
            return encrypt(
              {
                success: true,
                message: "Login successful",
                token: generateTokenWithExpire(tokenData, true)
              },
              false
            );
          }
        }
      }

      // Return error if user not found or invalid password
      return encrypt(
        {
          success: false,
          message: "Invalid login credentials",
        },
        false
      );
    } catch (error) {
      console.error("Error during login:", error);
      return encrypt(
        {
          success: false,
          message: "Internal server error",
        },
        false
      );
    }
  }
 public async addPartnersV1(user_data: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id };
    const tokens = generateTokenWithExpire(token, true);


    console.log("--->_",token);
    

    try {
      await client.query("BEGIN"); // Start Transaction

      const { partnersName, validityDate, mobileNumber } = user_data;

      if (!partnersName || typeof partnersName !== "string") {
        return encrypt(
          {
            success: false,
            message: "'Partner' must be a non-empty string.",
          },
          false
        );
      }


      console.log(tokendata);
      

      const result = await client.query(addPartnerQuery, [
        partnersName,
        tokendata.id, // Including refUserId
        mobileNumber,
        validityDate,
      ]);

      // Insert transaction history
      const txnHistoryParams = [
        2,
        tokendata.id,
        "Added new partner",
        CurrentTime(),
        "admin",
      ];
      await client.query(updateHistoryQuery, txnHistoryParams);

      await client.query("COMMIT"); // Commit Transaction

      return encrypt(
        {
          success: true,
          message: "Partner inserted successfully.",
          data: result,
        },
        false
      );
    } catch (error: any) {
      await client.query("ROLLBACK"); // Rollback Transaction in case of error

      console.error("Error during Partner insertion:", error);

      return encrypt(
        {
          success: false,
          message: "Partner insertion failed",
          error: error instanceof Error ? error.message : "An unknown error occurred",
        },
        false
      );
    } finally {
      client.release(); // Release DB connection
    }
  }
 public async updatePartnersV1(userData: any, tokenData: any): Promise<any> {
    const client: PoolClient = await getClient(); 
    const token = { id: tokenData.id }; 
    console.log('token', token);
    const tokens = generateTokenWithExpire(token, true);
    console.log('tokens', tokens);
  
    try {
      await client.query("BEGIN");
      const { partnerName, partnerId } = userData;
      const documentParams = [partnerName, partnerId];
      const partnerDetails = await client.query(updatePartnerQuery, documentParams);
      const txnHistoryParams = [
        3,
        tokenData.id, 
        "Update Partners", 
        CurrentTime(), 
        "vendor" 
      ];
      const txnHistoryResult = await client.query(updateHistoryQuery, txnHistoryParams);
        await client.query("COMMIT");
        return encrypt(
        {
          success: true,
          message: "Partner updated successfully",
          token: tokens,
          partnerDetails: partnerDetails,
        },
        false
      );
    } catch (error) {
      await client.query("ROLLBACK");
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error during Partner update:", error);
      return encrypt(
        {
          success: false,
          message: "Partner update failed",
          error: errorMessage,
          token: tokens,
        },
        false
      );
    } finally {
      client.release();
    }
  }
 public async deletePartnersV1(userData: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    try {
      if (!userData.documentId) {
        return encrypt(
          {
            success: false,
            message: "No Id provided in the payload",
          },
          true
        );
      }
      
      await client.query("BEGIN");
      
      const documentRecord = await client.query(getPartnerQuery, [userData.documentId]);
      if (!documentRecord.rows || documentRecord.rows.length === 0) {
        await client.query("ROLLBACK");
        return encrypt(
          {
            success: false,
            message: "Partner record not found",
          },
          false
        );
      }
      
      await client.query(deletePartnerQuery, [userData.documentId]);
      
      const TransTypeID = 4;
      const transData = "Partner Deleted";
      const TransTime = CurrentTime(); 
      const updatedBy = "Admin";
      const transactionValues = [TransTypeID, tokendata.id, transData, TransTime, updatedBy];
      
      await client.query(updateHistoryQuery, transactionValues);
      await client.query("COMMIT");
      
      return encrypt(
        {
          success: true,
          message: "Partner deleted successfully",
        },
        false
      );
    } catch (error) {
      console.error("Error in deleting Partner:", (error as Error).message);
      await client.query("ROLLBACK");
      return encrypt(
        {
          success: false,
          message: `Error in deleting Partner: ${(error as Error).message}`,
        },
        false
      );
    } finally {
      client.release();
    }
  }
 public async addVendorV1(user_data: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient(); 
    // const token = { id: tokendata.id }; 
    // const tokens = generateTokenWithExpire(token, true);
    try {
      const { paymentType } = user_data;

      if (!paymentType || typeof paymentType !== "string") {
        return encrypt(
          {
            success: false,
            message: "'Vendor' must be a non-empty string.",
            // token: tokens,
          },
          false
        );
      }
      const result = await client.query(addVendorQuery, [paymentType]);
      // const insertedData = result.rows[0];

      const txnHistoryParams = [
        5, 
        tokendata.id, 
        "add vendor", 
        CurrentTime(),  
        "Admin" 
      ];
      const txnHistoryResult = await client.query(updateHistoryQuery, txnHistoryParams);

      return encrypt(
        {
          success: true,
          message: 'vendor inserted successfully.',
        //token: tokens,
        //data: insertedData, 
        },
        false
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error during vendor insertion:', error);

      return encrypt(
        {
          success: false,
          message: 'vendor insertion failed',
          error: errorMessage,
        //   token: tokens,
        },
        false
      );
    }
  }
 public async updateVendorV1(userData: any, tokenData: any): Promise<any> {
    const client: PoolClient = await getClient(); 
    const token = { id: tokenData.id }; 
    console.log('token', token);
    const tokens = generateTokenWithExpire(token, true);
    console.log('tokens', tokens);
  
    try {
      await client.query("BEGIN");
  
      const { paymentTypeName, paymentId } = userData;
      const documentParams = [paymentTypeName, paymentId];
  
      const paymentDetails = await client.query(updateVendorQuery, documentParams);
  
      const txnHistoryParams = [
        6,
        tokenData.id, 
        "edit vendor", 
        CurrentTime(), 
        "Admin" 
      ];
  
      const txnHistoryResult = await client.query(updateHistoryQuery, txnHistoryParams);
        await client.query("COMMIT");
  
        return encrypt(
        {
          success: true,
          message: "vendor updated successfully",
        //   token: tokens,
          paymentDetails: paymentDetails,
        },
        false
      );
  
    } catch (error) {
      await client.query("ROLLBACK");
  
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error during vendor update:", error);
  
      return encrypt(
        {
          success: false,
          message: "vendor update failed",
          error: errorMessage,
        //   token: tokens,
        },
        false
      );
    } finally {
      client.release();
    }
  }
 public async deleteVendorV1(userData: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    try {
      if (!userData.documentId) {
        return encrypt(
          {
            success: false,
            message: "No Id provided in the payload",
          },
          true
        );
      }
      
      await client.query("BEGIN");
      
      const documentRecord = await client.query(getVendorQuery, [userData.documentId]);
      if (!documentRecord.rows || documentRecord.rows.length === 0) {
        await client.query("ROLLBACK");
        return encrypt(
          {
            success: false,
            message: "vendor record not found",
          },
          false
        );
      }
      
      await client.query(deleteVendorQuery, [userData.documentId]);
      
      const TransTypeID = 7;
      const transData = "vendor Deleted";
      const TransTime = CurrentTime(); 
      const updatedBy = "Admin";
      const transactionValues = [TransTypeID, tokendata.id, transData, TransTime, updatedBy];
      
      await client.query(updateHistoryQuery, transactionValues);
      await client.query("COMMIT");
      
      return encrypt(
        {
          success: true,
          message: "vendor deleted successfully",
        },
        false
      );
    } catch (error) {
      console.error("Error in deleting vendor:", (error as Error).message);
      await client.query("ROLLBACK");
      return encrypt(
        {
          success: false,
          message: `Error in deleting vendor: ${(error as Error).message}`,
        },
        false
      );
    } finally {
      client.release();
    }
  }
  }