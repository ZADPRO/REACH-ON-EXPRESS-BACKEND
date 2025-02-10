import { executeQuery, getClient } from "../../helper/db";
import { PoolClient } from "pg";
// import { storeFile, viewFile, deleteFile } from "../helper/storage";
import path from "path";
import { encrypt } from "../../helper/encrypt";
import { CurrentTime,generatePassword } from "../../helper/common";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateTokenWithExpire } from "../../helper/token";
import {
  selectUserByLogin, checkQuery, insertUserQuery, insertUserDomainQuery, insertUserCommunicationQuery,
  addPartnerQuery, addCustomerQuery, deletePartnerQuery, deleteCustomerQuery, getPartnerQuery, getCustomerQuery, updateHistoryQuery, updatePartnerQuery, updateCustomerQuery,
  getLastCustomerIdQuery, getLastEmployeeIdQuery,fetchProfileData
} from "./query";
import { generateSignupEmailContent } from "../../helper/mailcontent";
import { sendEmail } from "../../helper/mail";

export class adminRepository {
  public async userSignUpV1(userData: any, token_data?: any): Promise<any> {
    const client: PoolClient = await getClient();
    try {
      await client.query('BEGIN');
      const genPassword =  generatePassword()
      console.log('genPassword line ---- 24', genPassword)

      const genHashedPassword = await bcrypt.hash(genPassword, 10);
  
      // Check if the username already exists
      const check = [userData.temp_phone];
      const userCheck = await client.query(checkQuery, check);
      if (userCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return encrypt({ message: "Already exists", success: true }, false);
      }
  
      // Determine customer prefix based on userType
      let customerPrefix = userData.userType === 4 ? 'R-UNIQ-' : 'R-EMP-';
      let baseNumber = userData.userType === 4 ? 10000 : 0;
      const lastCustomerQuery = customerPrefix === 'R-UNIQ-' ? getLastCustomerIdQuery : getLastEmployeeIdQuery;
  
      // Fetch last customer ID based on customerPrefix
      const lastCustomerResult = await client.query(lastCustomerQuery);
      let newCustomerId: string;
  
      if (lastCustomerResult.rows.length > 0) {
        const lastNumber = parseInt(lastCustomerResult.rows[0].count, 10);
        newCustomerId = `${customerPrefix}${(baseNumber + lastNumber + 1).toString().padStart(4, '0')}`;
      } else {
        newCustomerId = `${customerPrefix}${(baseNumber + 1).toString().padStart(4, '0')}`;
      }
  
      // Insert into users table
      const params = [userData.temp_fname, userData.temp_lname, userData.userType, newCustomerId];
      const userResult = await client.query(insertUserQuery, params);
      const newUser = userResult.rows[0];
 
      // Insert into userDomain table
      const domainParams = [
        newUser.refUserId,
        userData.temp_phone,
        genPassword,
        genHashedPassword,
        userData.temp_phone,
      ];
      console.log('domainParams line ---- 65', domainParams)
      
      const domainResult = await client.query(insertUserDomainQuery, domainParams);
  
      // Insert into userCommunication table
      const communicationParams = [newUser.refUserId, userData.temp_phone, userData.temp_email];
      const communicationResult = await client.query(insertUserCommunicationQuery, communicationParams);
  
      if (
        (userResult.rowCount ?? 0) > 0 &&
        (domainResult.rowCount ?? 0) > 0 &&
        (communicationResult.rowCount ?? 0) > 0
      ) {
        const history = [8, newUser.refUserId, "User SignUp", CurrentTime(), "user"];
        const updateHistory = await client.query(updateHistoryQuery, history);
  
        if ((updateHistory.rowCount ?? 0) > 0) {
          const tokenData = {
            id: newUser.refUserId,
            email: userData.temp_su_email,
          };
          await client.query('COMMIT');
          const main = async () => {
                    const mailOptions = {
                      to: userData.temp_email, 
                      subject: "You Accont has be Created Successfully In our Platform", // Subject of the email
                      html: generateSignupEmailContent(userData.temp_phone, genPassword),
                    };
          
                    // Call the sendEmail function
                    try {
                      await sendEmail(mailOptions);
                    } catch (error) {
                      console.error("Failed to send email:", error);
                    }
                  };
          
                  main().catch(console.error);
          return encrypt(
            { success: true, message: "User signup successful", user: newUser, token: generateTokenWithExpire(tokenData, true) },
            true
          );
        }
      }
  
      await client.query('ROLLBACK');
      return encrypt({ success: false, message: "Signup failed" }, false);
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      console.error('Error during user signup:', error);
      return encrypt(
        {
          success: false,
          message: "An unexpected error occurred during signup",
          error: error instanceof Error ? error.message : String(error),
        },
        true
      );
    } finally {
      client.release();
    }
  }
  public async viewProfileV1(userData: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id }
    const tokens = generateTokenWithExpire(token, true)

    try {

      const refUserId = userData.refUserId;
      if (!refUserId) {
        throw new Error("Invalid refUserId. Cannot be null or undefined.");
      }
      const params = [refUserId];
      const profileResult = await executeQuery(fetchProfileData, params);

      if (profileResult.length === 0) {
        throw new Error("No profile data found for the given refUserId.");
      }

      const profileData = {
        fname: profileResult[0].refUserFName,
        lname: profileResult[0].refUserLName,
        refRoleId:profileResult[0].userTypeId,
        email: profileResult[0].refEmail,
        phone: profileResult[0].refMobileNo,
        address: profileResult[0].refCity,
        address1: profileResult[0].refState,
        address2: profileResult[0].refPincode,
        custMobile: profileResult[0].refCustMobileNum,
        password: profileResult[0].refCustpassword,
        hashedpassword: profileResult[0].refCusthashedpassword
      };
      const registerData = {
        ProfileData: profileData,
      };


      return encrypt({
        success: true,
        message: " Profile Page Data retrieved successfully",
        token: tokens,
        data: registerData,
      }, false);
    } catch (error) {
      const errorMessage = (error as Error).message; // Cast `error` to `Error` type
      console.error('Error in profilePageDataV1:', errorMessage);
      return encrypt({
        success: false,
        message: `Error in Profile Page Data retrieval: ${errorMessage}`,
        token: tokens
      }, false);
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


    console.log("--->_", token);


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
        "Customer"
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
  public async getPartnersV1(user_data: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id }; // Extract token ID
    console.log('token', token);

    // Generate token with expiration
    const tokens = generateTokenWithExpire(token, true);
    console.log('tokens', tokens);

    try {
      const { partnersId } = user_data;

      // Get Restaurant/Document Details
      const partners = await executeQuery(getPartnerQuery, [partnersId]);

      // Return success response
      return encrypt(
        {
          success: true,
          message: 'Returned partners successfully',
          token: tokens,
          partners: partners,
        },
        false
      );
    } catch (error) {
      // Error handling
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error during data retrieval:', error);

      // Return error response
      return encrypt(
        {
          success: false,
          message: 'Data retrieval failed',
          error: errorMessage,
          token: tokens,
        },
        false
      );
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
  public async addCustomerV1(user_data: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id }; 
    const tokens = generateTokenWithExpire(token, true);
    try {
      const { paymentType } = user_data;

      if (!paymentType || typeof paymentType !== "string") {
        return encrypt(
          {
            success: false,
            message: "'Customer' must be a non-empty string.",
            token: tokens,
          },
          false
        );
      }
      const result = await client.query(addCustomerQuery, [paymentType]);
      // const insertedData = result.rows[0];

      const txnHistoryParams = [
        5,
        tokendata.id,
        "add Customer",
        CurrentTime(),
        "Admin"
      ];
      const txnHistoryResult = await client.query(updateHistoryQuery, txnHistoryParams);

      return encrypt(
        {
          success: true,
          message: 'Customer inserted successfully.',
          token: tokens,
          //data: insertedData, 
        },
        false
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error during Customer insertion:', error);

      return encrypt(
        {
          success: false,
          message: 'Customer insertion failed',
          error: errorMessage,
          //   token: tokens,
        },
        false
      );
    }
  }
  public async updateCustomerV1(userData: any, tokenData: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokenData.id };
    console.log('token', token);
    const tokens = generateTokenWithExpire(token, true);
    console.log('tokens', tokens);

    try {
      await client.query("BEGIN");

      const { paymentTypeName, paymentId } = userData;
      const documentParams = [paymentTypeName, paymentId];

      const paymentDetails = await client.query(updateCustomerQuery, documentParams);

      const txnHistoryParams = [
        6,
        tokenData.id,
        "edit Customer",
        CurrentTime(),
        "Admin"
      ];

      const txnHistoryResult = await client.query(updateHistoryQuery, txnHistoryParams);
      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message: "Customer updated successfully",
          //   token: tokens,
          paymentDetails: paymentDetails,
        },
        false
      );

    } catch (error) {
      await client.query("ROLLBACK");

      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error during Customer update:", error);

      return encrypt(
        {
          success: false,
          message: "Customer update failed",
          error: errorMessage,
          //   token: tokens,
        },
        false
      );
    } finally {
      client.release();
    }
  }
  public async getCustomerV1(user_data: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id }; // Extract token ID
    console.log('token', token);

    // Generate token with expiration
    const tokens = generateTokenWithExpire(token, true);
    console.log('tokens', tokens);

    try {
      const { refCustomerId } = user_data;

      // Get Restaurant/Document Details
      const Customer = await executeQuery(getCustomerQuery, [refCustomerId]);

      // Return success response
      return encrypt(
        {
          success: true,
          message: 'Returned Customer successfully',
          token: tokens,
          Customer: Customer,
        },
        false
      );
    } catch (error) {
      // Error handling
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error during data retrieval:', error);

      // Return error response
      return encrypt(
        {
          success: false,
          message: 'Data retrieval failed',
          error: errorMessage,
          token: tokens,
        },
        false
      );
    }
  }
  public async deleteCustomerV1(userData: any, tokendata: any): Promise<any> {
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

      const documentRecord = await client.query(getCustomerQuery, [userData.documentId]);
      if (!documentRecord.rows || documentRecord.rows.length === 0) {
        await client.query("ROLLBACK");
        return encrypt(
          {
            success: false,
            message: "Customer record not found",
          },
          false
        );
      }

      await client.query(deleteCustomerQuery, [userData.documentId]);

      const TransTypeID = 7;
      const transData = "Customer Deleted";
      const TransTime = CurrentTime();
      const updatedBy = "Admin";
      const transactionValues = [TransTypeID, tokendata.id, transData, TransTime, updatedBy];

      await client.query(updateHistoryQuery, transactionValues);
      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message: "Customer deleted successfully",
        },
        false
      );
    } catch (error) {
      console.error("Error in deleting Customer:", (error as Error).message);
      await client.query("ROLLBACK");
      return encrypt(
        {
          success: false,
          message: `Error in deleting Customer: ${(error as Error).message}`,
        },
        false
      );
    } finally {
      client.release();
    }
  }
}