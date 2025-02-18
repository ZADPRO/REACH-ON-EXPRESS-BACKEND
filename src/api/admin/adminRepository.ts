import { executeQuery, getClient } from "../../helper/db";
import { PoolClient } from "pg";
// import { storeFile, viewFile, deleteFile } from "../helper/storage";
import path from "path";
import { encrypt } from "../../helper/encrypt";
import { CurrentTime, generatePassword } from "../../helper/common";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateTokenWithExpire } from "../../helper/token";
import {
  selectUserByLogin,
  checkQuery,
  insertUserQuery,
  insertUserDomainQuery,
  insertUserCommunicationQuery,
  addPartnerQuery,
  insertCustomerQuery,
  softDeleteQuery,
  getPartnerQuery,
  getCustomerQuery,
  updateHistoryQuery,
  updatePartnerQuery,
  updateCustomerQuery,
  getLastCustomerIdQuery,
  getLastEmployeeIdQuery,
  fetchProfileData,
  addPriceDetailsQuery,
  insertCategoryQuery,
  getAllCategoriesQuery,
  insertSubcategoryQuery,
  getAllSubcategoriesQuery,
  getLastCustomerRefIdQuery,
  userDetailsQuery,
  customerSoftDeleteQuery,
  getPartnersQuery,
  getCUstomersQuery,
  getPriceQuery,
  getAllEmployeeQuery,
  getUsertypeQuery,
<<<<<<< HEAD
  getCustomerCount
=======
>>>>>>> 0416bc8527bd28bd319b40373d50a5784e0e7c6f
} from "./query";
import { generateSignupEmailContent } from "../../helper/mailcontent";
import { sendEmail } from "../../helper/mail";
import moment from "moment";

export class adminRepository {
  public async addEmployeeV1(userData: any, token_data?: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: token_data.id }; // Extract token ID
    const tokens = generateTokenWithExpire(token, true);
    try {
      await client.query("BEGIN");
      const genPassword = generatePassword();
      const genHashedPassword = await bcrypt.hash(genPassword, 10);

      // Check if the username already exists
      const check = [userData.temp_phone];
      const userCheck = await client.query(checkQuery, check);
      if (userCheck.rows.length > 0) {
        await client.query("ROLLBACK");
        return encrypt(
          {
            success: true,
            message: "Already exists",
          },
          true
        );
      }

      // Determine customer prefix based on userType
      let customerPrefix = userData.userType === 4 ? "R-UNIQ-" : "R-EMP-";
      let baseNumber = userData.userType === 4 ? 10000 : 0;
      const lastCustomerQuery =
        customerPrefix === "R-UNIQ-"
          ? getLastCustomerIdQuery
          : getLastEmployeeIdQuery;

      // Fetch last customer ID based on customerPrefix
      const lastCustomerResult = await client.query(lastCustomerQuery);
      console.log("lastCustomerResult", lastCustomerResult);
      let newCustomerId: string;

      if (lastCustomerResult.rows.length > 0) {
        const lastNumber = parseInt(lastCustomerResult.rows[0].count, 10);
        newCustomerId = `${customerPrefix}${(baseNumber + lastNumber + 1)
          .toString()
          .padStart(4, "0")}`;
      } else {
        newCustomerId = `${customerPrefix}${(baseNumber + 1)
          .toString()
          .padStart(4, "0")}`;
      }

      // Insert into users table
      const params = [
        userData.temp_fname,
        userData.temp_lname,
        userData.designation,
        userData.userType,
        newCustomerId,
        userData.dateOfBirth,
        userData.qualification,
      ];
      const userResult = await client.query(insertUserQuery, params);
      console.log("userResult", userResult);
      const newUser = userResult.rows[0];
      console.log("newUser", newUser);

      // Insert into userDomain table
      const domainParams = [
        newUser.refUserId,
        userData.temp_phone,
        genPassword,
        genHashedPassword,
        userData.temp_phone,
      ];

      const domainResult = await client.query(
        insertUserDomainQuery,
        domainParams
      );
      console.log("domainResult", domainResult);

      // Insert into userCommunication table
      const communicationParams = [
        newUser.refUserId,
        userData.temp_phone,
        userData.temp_email,
      ];
      const communicationResult = await client.query(
        insertUserCommunicationQuery,
        communicationParams
      );
      console.log("communicationResult", communicationResult);

      if (
        (userResult.rowCount ?? 0) > 0 &&
        (domainResult.rowCount ?? 0) > 0 &&
        (communicationResult.rowCount ?? 0) > 0
      ) {
        const history = [
          8,
          newUser.refUserId,
          "User SignUp",
          CurrentTime(),
          "user",
        ];
        const updateHistory = await client.query(updateHistoryQuery, history);

        if ((updateHistory.rowCount ?? 0) > 0) {
          const tokenData = {
            id: newUser.refUserId,
            email: userData.temp_su_email,
          };
          await client.query("COMMIT");
          const main = async () => {
            const mailOptions = {
              to: userData.temp_email,
              subject: "You Accont has be Created Successfully In our Platform", // Subject of the email
              html: generateSignupEmailContent(
                userData.temp_phone,
                genPassword
              ),
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
            {
              success: true,
              message: "User signup successful",
              user: newUser,
              token: tokens,
            },
            true
          );
        }
      }

      await client.query("ROLLBACK");
      return encrypt(
        {
          success: false,
          message: "Signup failed",
          token: tokens,
        },
        true
      );
    } catch (error: unknown) {
      await client.query("ROLLBACK");
      console.error("Error during user signup:", error);
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
    const token = { id: tokendata.id };
    const tokens = generateTokenWithExpire(token, true);
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
        refRoleId: profileResult[0].userTypeId,
        email: profileResult[0].refEmail,
        phone: profileResult[0].refMobileNo,
        address: profileResult[0].refCity,
        address1: profileResult[0].refState,
        address2: profileResult[0].refPincode,
        custMobile: profileResult[0].refCustMobileNum,
        password: profileResult[0].refCustpassword,
        hashedpassword: profileResult[0].refCusthashedpassword,
      };
      const registerData = {
        ProfileData: profileData,
      };

      return encrypt(
        {
          success: true,
          message: " Profile Page Data retrieved successfully",
          token: tokens,
          data: registerData,
        },
        false
      );
    } catch (error) {
      const errorMessage = (error as Error).message; // Cast `error` to `Error` type
      console.error("Error in profilePageDataV1:", errorMessage);
      return encrypt(
        {
          success: false,
          message: `Error in Profile Page Data retrieval: ${errorMessage}`,
          token: tokens,
        },
        false
      );
    }
  }
  public async getUsertypeV1(userData: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id }; // Extract token ID
    const tokens = generateTokenWithExpire(token, true);

    try {
      const Usertype = await executeQuery(getUsertypeQuery);
      console.log("Usertype", Usertype);

      // Return success response
      return encrypt(
        {
          success: true,
          message: "Returned usertype successfully",
          token: tokens,
          Usertype: Usertype,
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
  public async getEmployeeV1(userData: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id }; // Extract token ID
    const tokens = generateTokenWithExpire(token, true);

    try {
      const Employee = await executeQuery(getAllEmployeeQuery);

      // Return success response
      return encrypt(
        {
          success: true,
          message: "Returned sub Category successfully",
          token: tokens,
          Employee: Employee,
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
  public async adminloginV1(user_data: any, domain_code?: any): Promise<any> {
    try {
      const params = [user_data.login];
      const users = await executeQuery(selectUserByLogin, params);

      if (users.length > 0) {
        const user = users[0];
        console.log("user", user);

        // Verify the password
        const validPassword = await bcrypt.compare(
          user_data.password,
          user.refCusthashedpassword
        );
        if (validPassword) {
          const history = [1, user.refUserId, "Login", CurrentTime(), "Admin"];
          const updateHistory = await executeQuery(updateHistoryQuery, history);

          if (updateHistory) {
            const tokenData = { id: user.refUserId };

            const userDetails = await executeQuery(userDetailsQuery, [
              user.refUserId,
            ]);

            return encrypt(
              {
                success: true,
                message: "Login successful",
                userDetails: userDetails,
                token: generateTokenWithExpire(tokenData, true),
              },
              true
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
        true
      );
    } catch (error) {
      console.error("Error during login:", error);
      return encrypt(
        {
          success: false,
          message: "Check the credentials",
        },
        true
      );
    }
  }
  public async addPartnersV1(user_data: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
      await client.query("BEGIN"); // Start Transaction

      const { partnersName, validityDate, mobileNumber } = user_data;

      if (!partnersName || typeof partnersName !== "string") {
        return encrypt(
          {
            success: false,
            message: "'Partner' must be a non-empty string.",
          },
          true
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
          token: tokens,

          data: result,
        },
        true
      );
    } catch (error: any) {
      await client.query("ROLLBACK"); // Rollback Transaction in case of error

      console.error("Error during Partner insertion:", error);

      return encrypt(
        {
          success: false,
          message: "Partner insertion failed",
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
  public async updatePartnersV1(userData: any, tokenData: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokenData.id };
    console.log("token", token);
    const tokens = generateTokenWithExpire(token, true);
    console.log("tokens", tokens);

    try {
      await client.query("BEGIN");
      const { partnersName, phoneNumber, validity, partnerId } = userData;
      const documentParams = [partnersName, phoneNumber, validity, partnerId];
      const partnerDetails = await client.query(
        updatePartnerQuery,
        documentParams
      );
      const txnHistoryParams = [
        3,
        tokenData.id,
        "Update Partners",
        CurrentTime(),
        "Admin",
      ];
      const txnHistoryResult = await client.query(
        updateHistoryQuery,
        txnHistoryParams
      );
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
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
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
    console.log("token", token);

    // Generate token with expiration
    const tokens = generateTokenWithExpire(token, true);
    console.log("tokens", tokens);

    try {
      const { partnerId } = user_data;
      console.log("user_data", user_data);
      console.log("partnersId", partnerId);

      // Get Restaurant/Document Details
      const partners = await executeQuery(getPartnerQuery, [partnerId]);
      console.log("partners", partners);

      // Return success response
      return encrypt(
        {
          success: true,
          message: "Returned partners successfully",
          token: tokens,
          partners: partners,
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
  public async getPartnerV1(user_data: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id }; // Extract token ID
    console.log("token", token);

    // Generate token with expiration
    const tokens = generateTokenWithExpire(token, true);
    console.log("tokens", tokens);

    try {
      const partners = await executeQuery(getPartnersQuery);
      console.log("partners", partners);

      // Return success response
      return encrypt(
        {
          success: true,
          message: "Returned partners successfully",
          token: tokens,
          partners: partners,
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
  public async deletePartnersV1(userData: any, tokenData: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokenData.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
      const { partnerId } = userData;

      if (!partnerId) {
        return encrypt(
          {
            success: false,
            message: "Invalid request: partnerId is required.",
          },
          true
        );
      }

      await client.query("BEGIN");

      // Check if the partner exists before attempting an update
      const existingPartner = await client.query(getPartnerQuery, [partnerId]);

      if (existingPartner.rowCount === 0) {
        await client.query("ROLLBACK");
        return encrypt(
          {
            success: false,
            message: "Partner record not found.",
            token: tokens,
          },
          false
        );
      }

      await client.query(softDeleteQuery, [partnerId]);

      // Log transaction history
      const transactionValues = [
        4, // Transaction type ID for delete
        tokenData.id,
        "Partner Soft Deleted",
        CurrentTime(),
        "Admin",
      ];
      await client.query(updateHistoryQuery, transactionValues);

      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message: "Partner marked as deleted successfully.",
          token: tokens,
        },
        false
      );
    } catch (error) {
      console.error("Error marking Partner as deleted:", error);
      await client.query("ROLLBACK");

      return encrypt(
        {
          success: false,
          message: `Error marking Partner as deleted: ${
            (error as Error).message
          }`,
          token: tokens,
        },
        false
      );
    } finally {
      client.release();
    }
  }
  public async addCustomerV1(userData: any, tokenData: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokenData.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
      await client.query("BEGIN"); // Start transaction

<<<<<<< HEAD
      const { customerName, customerCode, customerType, notes, refAddress, refPhone } = userData;
      const currentMonth = moment().format("MM");
      const currentYear = moment().format("YY");

      // Get the total customer count
      const userCountResult = await executeQuery(getCustomerCount);
      const userCount = parseInt(userCountResult[0]?.count ?? "0", 10); // Convert count to a number
      const nextCustomerNumber = userCount + 1; // Increment customer count

      // Generate new refCustId
      const refCustId = `R-${customerCode}-${String(10000 + nextCustomerNumber)}-${currentMonth}-${currentYear}`;
      console.log("Generated refCustId:", refCustId);
=======
      const {
        customerName,
        customerCode,
        customerType,
        notes,
        refAddress,
        refPhone,
      } = userData;

      // if (!customerName || typeof customerName !== "string") {
      //     await client.query("ROLLBACK");
      //     return encrypt(
      //         {
      //             success: false,
      //             message: "'customerName' must be a non-empty string.",
      //             token: tokens,
      //         },
      //         false
      //     );
      // }

      const currentMonth = moment().format("MM");
      const currentYear = moment().format("YY");

      // Get the last inserted customer refCustId for the given refCode
      const lastCustomerResult = await client.query(getLastCustomerRefIdQuery, [
        userData.customerCode,
      ]);
      let nextCustomerNumber = 100001; // Default start number

      if (lastCustomerResult.rows.length > 0) {
        const lastRefCustId = lastCustomerResult.rows[0].refCustId; // Example: R-XYZ-100001-01-2025
        const lastNumberMatch = lastRefCustId.match(/(\d{6})-\d{2}-\d{2}$/);

        if (lastNumberMatch) {
          nextCustomerNumber = parseInt(lastNumberMatch[1], 10) + 1; // Increment the last number
        }
      }
      const refCustId = `R-${customerCode}-${nextCustomerNumber}-${currentMonth}-${currentYear}`;
      console.log("refCustId", refCustId);
>>>>>>> 0416bc8527bd28bd319b40373d50a5784e0e7c6f

      // Insert Customer
      const { rows } = await client.query(insertCustomerQuery, [
        refCustId,
        customerName,
        customerCode,
        notes,
        customerType ?? true,
        refAddress,
        refPhone,
      ]);

<<<<<<< HEAD
      if (rows.length === 0) {
=======
      console.log("rows line 566", rows);
      if (rows.length === 0) {
        console.log("rows", rows);
>>>>>>> 0416bc8527bd28bd319b40373d50a5784e0e7c6f
        await client.query("ROLLBACK");
        return encrypt(
          {
            success: false,
            message: "Customer insertion failed.",
            token: tokens,
          },
          false
        );
      }

      // Insert Transaction History
      await client.query(updateHistoryQuery, [
        5,
<<<<<<< HEAD
        parseInt(tokenData.id),
        "Added a customer",
        moment().format("YYYY-MM-DD HH:mm:ss"),
=======
        tokenData.id,
        "Added a customer",
        CurrentTime(),
>>>>>>> 0416bc8527bd28bd319b40373d50a5784e0e7c6f
        "Admin",
      ]);

      await client.query("COMMIT"); // Commit transaction

      return encrypt(
        {
          success: true,
          message: "Customer inserted successfully.",
          token: tokens,
          data: rows, // Return inserted data
        },
        false
      );
    } catch (error) {
      await client.query("ROLLBACK"); // Rollback transaction on failure
      console.error("Error during Customer insertion:", error);

      return encrypt(
        {
          success: false,
          message: "Customer insertion failed",
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
          token: tokens,
        },
        false
      );
    } finally {
      client.release(); // Ensure client is released
    }
  }
  public async getCustomersV1(userData: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id }; // Extract token ID
    console.log("token", token);

    // Generate token with expiration
    const tokens = generateTokenWithExpire(token, true);
    console.log("tokens", tokens);

    try {
      const Customer = await executeQuery(getCUstomersQuery);

      // Return success response
      return encrypt(
        {
          success: true,
          message: "Returned Customer successfully",
          token: tokens,
          Customer: Customer,
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
  public async updateCustomerV1(userData: any, tokenData: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokenData.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
      await client.query("BEGIN"); // Start transaction

      const { customerName, customerCode, notes, customerType, refCustomerId } =
        userData;

      if (!refCustomerId) {
        return encrypt(
          {
            success: false,
            message: "Invalid request: refCustomerId is required.",
            token: tokens,
          },
          false
        );
      }

      // Check if the customer exists
      const existingCustomer = await client.query(getCustomerQuery, [
        refCustomerId,
      ]);
      if (existingCustomer.rowCount === 0) {
        await client.query("ROLLBACK");
        return encrypt(
          {
            success: false,
            message: "Customer record not found.",
            token: tokens,
          },
          false
        );
      }

      // Update Customer
      const updateParams = [
        customerName,
        customerCode,
        notes,
        customerType ?? true,
        refCustomerId,
      ];
      const updatedCustomer = await client.query(
        updateCustomerQuery,
        updateParams
      );

      if (updatedCustomer.rowCount === 0) {
        await client.query("ROLLBACK");
        return encrypt(
          {
            success: false,
            message: "Customer update failed.",
            token: tokens,
          },
          false
        );
      }

      // Insert Transaction History
      const txnHistoryParams = [
        6,
        tokenData.id,
        "Customer updated",
        CurrentTime(),
        "Admin",
      ];
      await client.query(updateHistoryQuery, txnHistoryParams);

      await client.query("COMMIT"); // Commit transaction

      return encrypt(
        {
          success: true,
          message: "Customer updated successfully.",
          token: tokens,
          data: updatedCustomer.rows[0],
        },
        false
      );
    } catch (error) {
      await client.query("ROLLBACK"); // Rollback transaction on failure
      console.error("Error during Customer update:", error);

      return encrypt(
        {
          success: false,
          message: "Customer update failed.",
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
          token: tokens,
        },
        false
      );
    } finally {
      client.release(); // Ensure client is released
    }
  }
  public async getCustomerV1(user_data: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id }; // Extract token ID
    console.log("token", token);

    // Generate token with expiration
    const tokens = generateTokenWithExpire(token, true);
    console.log("tokens", tokens);

    try {
      const { refCustomerId } = user_data;

      // Get Restaurant/Document Details
      const Customer = await executeQuery(getCustomerQuery, [refCustomerId]);

      // Return success response
      return encrypt(
        {
          success: true,
          message: "Returned Customer successfully",
          token: tokens,
          Customer: Customer,
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
  public async deleteCustomerV1(userData: any, tokenData: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokenData.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
      const { refCustomerId } = userData;

      if (!refCustomerId) {
        return encrypt(
          {
            success: false,
            message: "Invalid request: refCustomerId is required.",
          },
          true
        );
      }

      await client.query("BEGIN");

      // Check if the partner exists before attempting an update
      const existingPartner = await client.query(getCustomerQuery, [
        refCustomerId,
      ]);
      console.log(
        "refCustomerId------------------------------------",
        refCustomerId
      );
      console.log("existingPartner", existingPartner);

      if (existingPartner.rowCount === 0) {
        await client.query("ROLLBACK");
        return encrypt(
          {
            success: false,
            message: "customer record not found.",
            token: tokens,
          },
          false
        );
      }

      await client.query(customerSoftDeleteQuery, [refCustomerId]);

      // Log transaction history
      const transactionValues = [
        4, // Transaction type ID for delete
        tokenData.id,
        "Partner Soft Deleted",
        CurrentTime(),
        "Admin",
      ];
      await client.query(updateHistoryQuery, transactionValues);

      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message: "Partner marked as deleted successfully.",
          token: tokens,
        },
        false
      );
    } catch (error) {
      console.error("Error marking Partner as deleted:", error);
      await client.query("ROLLBACK");

      return encrypt(
        {
          success: false,
          message: `Error marking Partner as deleted: ${
            (error as Error).message
          }`,
          token: tokens,
        },
        false
      );
    } finally {
      client.release();
    }
  }
  public async addPricingV1(userData: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id };

    try {
      await client.query("BEGIN"); // Start Transaction

      const { partnersId, minWeight, maxWeight, price, dimension, answer } =
        userData;

      if (!partnersId || !minWeight || !maxWeight || !price) {
        return encrypt(
          {
            success: false,
            message: "Missing required fields.",
          },
          false
        );
      }

      let params = [partnersId, minWeight, maxWeight, price, dimension ? 1 : 0]; // First 6 parameters

      if (dimension) {
        const { length, breadth, height, calculation } = userData;

        if (!length || !breadth || !height || !calculation) {
          return encrypt(
            {
              success: false,
              message: "Missing dimension details.",
            },
            true
          );
        }
        params.push(length, breadth, height, calculation); // Push remaining 4 parameters
      } else {
        params.push(null, null, null, null); // Fill with NULL if dimension is false
      }

      params.push(answer); // Always push answer (last parameter)

      const result = await client.query(addPriceDetailsQuery, params);

      // Insert transaction history
      const txnHistoryParams = [
        9,
        tokendata.id,
        "Added price details",
        CurrentTime(),
        "admin",
      ];
      await client.query(updateHistoryQuery, txnHistoryParams);

      await client.query("COMMIT"); // Commit Transaction

      return encrypt(
        {
          success: true,
          message: "Weight details added successfully.",
          data: result,
        },
        true
      );
    } catch (error: any) {
      await client.query("ROLLBACK"); // Rollback Transaction in case of error

      console.error("Error during weight details insertion:", error);

      return encrypt(
        {
          success: false,
          message: "Weight details insertion failed",
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        },
        true
      );
    } finally {
      client.release(); // Release DB connection
    }
  }
  public async getPricingV1(user_data: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id }; // Extract token ID
    console.log("token", token);

    // Generate token with expiration
    const tokens = generateTokenWithExpire(token, true);
    console.log("tokens", tokens);

    try {
      // Get Restaurant/Document Details
      const price = await executeQuery(getPriceQuery);

      // Return success response
      return encrypt(
        {
          success: true,
          message: "Returned price successfully",
          token: tokens,
          price: price,
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
  public async addCategoryV1(userData: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id }; // Extract token ID
    const tokens = generateTokenWithExpire(token, true);

    try {
      await client.query("BEGIN"); // Start Transaction

      const { category } = userData;

      if (!category || typeof category !== "string") {
        return encrypt(
          {
            success: false,
            message: "'category' must be a non-empty string.",
          },
          true
        );
      }

      // Insert category into the database
      const result = await client.query(insertCategoryQuery, [category]);
      const insertedCategory = result.rows[0];

      // Insert transaction history
      const txnHistoryParams = [
        10, // TransTypeID (5 -> Category Addition)
        tokendata.id, // refUserId
        `Add Category`, // transData
        CurrentTime(), // TransTime
        "admin", // UpdatedBy
      ];
      await client.query(updateHistoryQuery, txnHistoryParams);

      // Commit Transaction
      await client.query("COMMIT");

      // Fetch all categories after insertion
      // const allCategories = await client.query(getAllCategoriesQuery);

      return encrypt(
        {
          success: true,
          message: "Category inserted successfully.",
          // data: allCategories, // Return all categories
          token: tokens,
        },
        true
      );
    } catch (error: any) {
      await client.query("ROLLBACK"); // Rollback Transaction on Error

      console.error("Error inserting category:", error);

      return encrypt(
        {
          success: false,
          message: "Category insertion failed",
          error: error.message || "An unknown error occurred",
          token: tokens,
        },
        true
      );
    } finally {
      client.release(); // Release DB connection
    }
  }
  public async getCategoryV1(userData: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id }; // Extract token ID
    console.log("token", token);

    // Generate token with expiration
    const tokens = generateTokenWithExpire(token, true);
    console.log("tokens", tokens);

    try {
      const allCategories = await executeQuery(getAllCategoriesQuery);

      // Return success response
      return encrypt(
        {
          success: true,
          message: "Returned Category successfully",
          token: tokens,
          Category: allCategories,
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
  public async addSubCategoryV1(userData: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id }; // Extract token ID
    const tokens = generateTokenWithExpire(token, true);
    try {
      await client.query("BEGIN"); // Start Transaction

      const { categoryId, subcategory } = userData;

      if (!categoryId || !subcategory) {
        return encrypt(
          {
            success: false,
            message: "Missing categoryId or subcategory.",
          },
          false
        );
      }

      const result = await client.query(insertSubcategoryQuery, [
        categoryId,
        subcategory,
      ]);

      // const allSubcategories = await client.query(getAllSubcategoriesQuery);
      const txnHistoryParams = [
        11, // TransTypeID (5 -> Category Addition)
        tokendata.id, // refUserId
        `Add sub Category`, // transData
        CurrentTime(), // TransTime
        "admin", // UpdatedBy
      ];
      await client.query(updateHistoryQuery, txnHistoryParams);
      await client.query("COMMIT"); // Commit Transaction

      return encrypt(
        {
          success: true,
          message: "Subcategory inserted successfully.",
          // data: allSubcategories.rows, // Return all subcategories
          token: tokens,
        },
        true
      );
    } catch (error: any) {
      await client.query("ROLLBACK");

      console.error("Error inserting subcategory:", error);

      return encrypt(
        {
          success: false,
          message: "Subcategory insertion failed",
          error: error.message || "An unknown error occurred",
          token: tokens,
        },
        true
      );
    } finally {
      client.release();
    }
  }
  public async getSubCategoryV1(userData: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id }; // Extract token ID

    // Generate token with expiration
    const tokens = generateTokenWithExpire(token, true);

    try {
      const allSubcategories = await executeQuery(getAllSubcategoriesQuery);

      // Return success response
      return encrypt(
        {
          success: true,
          message: "Returned sub Category successfully",
          token: tokens,
          SubCategory: allSubcategories,
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
}
