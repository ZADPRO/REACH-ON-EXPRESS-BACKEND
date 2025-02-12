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
  addPartnerQuery, insertCustomerQuery, deletePartnerQuery, deleteCustomerQuery, getPartnerQuery, getCustomerQuery, updateHistoryQuery, updatePartnerQuery, updateCustomerQuery,
  getLastCustomerIdQuery, getLastEmployeeIdQuery,fetchProfileData,
  addPriceDetailsQuery,
  insertCategoryQuery,
  getAllCategoriesQuery,
  insertSubcategoryQuery,
  getAllSubcategoriesQuery,
  getLastCustomerRefIdQuery
} from "./query";
import { generateSignupEmailContent } from "../../helper/mailcontent";
import { sendEmail } from "../../helper/mail";
import moment from "moment";

export class adminRepository {
  public async addEmployeeV1(userData: any, token_data?: any): Promise<any> {
    const client: PoolClient = await getClient();
    try {
      await client.query('BEGIN');
      const genPassword =  generatePassword()
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
      const params = [userData.temp_fname, userData.temp_lname, userData.designation, userData.userType, newCustomerId];
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
            { 
              success: true, 
              message: "User signup successful", 
              user: newUser, 
             },
            false
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
        false
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
          token: tokens,

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
          token: tokens,

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
        "Admin"
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
    const token = { id: tokendata.id };
    const tokens = generateTokenWithExpire(token, true);
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
            token: tokens,
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
          token: tokens,

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


  public async addCustomerV1(userData: any, tokenData: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokenData.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
        await client.query("BEGIN"); // Start transaction

        const { customerName, customerCode, customerType, notes } = userData;

        // Validate required fields
        if (!customerName || typeof customerName !== "string") {
            await client.query("ROLLBACK");
            return encrypt(
                {
                    success: false,
                    message: "'customerName' must be a non-empty string.",
                    token: tokens,
                },
                false
            );
        }

        // Generate new refCustId (Pattern: R-{refCode}-100001-{MM}-{YYYY})
        const currentMonth = moment().format("MM");
        const currentYear = moment().format("YYYY");

        // Get the last inserted customer refCustId for the given refCode
        const lastCustomerResult = await client.query(getLastCustomerRefIdQuery, [customerCode]);
        let nextCustomerNumber = 100001; // Default start number

        if (lastCustomerResult.rows.length > 0) {
            const lastRefCustId = lastCustomerResult.rows[0].refCustId; // Example: R-XYZ-100001-01-2025
            const lastNumberMatch = lastRefCustId.match(/(\d{6})-\d{2}-\d{4}$/);

            if (lastNumberMatch) {
                nextCustomerNumber = parseInt(lastNumberMatch[1], 10) + 1; // Increment the last number
            }
        }

        const refCustId = `R-${customerCode}-${nextCustomerNumber}-${currentMonth}-${currentYear}`;

        // Insert Customer
        const { rows } = await client.query(insertCustomerQuery, [
            refCustId, 
            customerName,
            customerCode || null,
            customerType ?? true, // Defaults to true if undefined
            notes || null,
        ]);

        if (rows.length === 0) {
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
        await client.query(updateHistoryQuery, [5, tokenData.id, "Added a customer", "Admin"]);

        await client.query("COMMIT"); // Commit transaction

        return encrypt(
            {
                success: true,
                message: "Customer inserted successfully.",
                token: tokens,
                data: rows[0], // Return inserted data
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
                error: error instanceof Error ? error.message : "An unknown error occurred",
                token: tokens,
            },
            false
        );
    } finally {
        client.release(); // Ensure client is released
    }
}




  public async updateCustomerV1(userData: any, tokenData: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokenData.id };
    console.log('token', token);
    const tokens = generateTokenWithExpire(token, true);

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
          token: tokens,
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
          token: tokens,
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
  public async addPricingV1(userData: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id };

    try {
        await client.query("BEGIN"); // Start Transaction

        const { partnersId, refCustomerId, minWeight, maxWeight, price, dimension, answer } = userData;

        if (!partnersId || !refCustomerId || !minWeight || !maxWeight || !price) {
            return encrypt(
                {
                    success: false,
                    message: "Missing required fields.",
                },
                false
            );
        }

        let params = [partnersId, refCustomerId, minWeight, maxWeight, price, dimension ? 1 : 0]; // First 6 parameters

        if (dimension) {
            const { length, breadth, height, calculation } = userData;

            if (!length || !breadth || !height || !calculation) {
                return encrypt(
                    {
                        success: false,
                        message: "Missing dimension details.",
                    },
                    false
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
                data: result.rows,
            },
            false
        );
    } catch (error: any) {
        await client.query("ROLLBACK"); // Rollback Transaction in case of error

        console.error("Error during weight details insertion:", error);

        return encrypt(
            {
                success: false,
                message: "Weight details insertion failed",
                error: error instanceof Error ? error.message : "An unknown error occurred",
            },
            false
        );
    } finally {
        client.release(); // Release DB connection
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
                false
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
            CurrentTime(),  // TransTime
            "admin" // UpdatedBy
        ];
        await client.query(updateHistoryQuery, txnHistoryParams);

        // Commit Transaction
        await client.query("COMMIT");

        // Fetch all categories after insertion
        const allCategories = await client.query(getAllCategoriesQuery);

        return encrypt(
            {
                success: true,
                message: "Category inserted successfully.",
                data: allCategories.rows, // Return all categories
                token: tokens,
            },
            false
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
            false
        );
    } finally {
        client.release(); // Release DB connection
    }
  }
  public async addSubCategoryV1(userData: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id }; // Extract token ID
    const tokens = generateTokenWithExpire(token, true)
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

        const result = await client.query(insertSubcategoryQuery, [categoryId, subcategory]);

        // Fetch all subcategories after insertion
        const allSubcategories = await client.query(getAllSubcategoriesQuery);
        const txnHistoryParams = [
          11, // TransTypeID (5 -> Category Addition)
          tokendata.id, // refUserId
          `Add sub Category`, // transData
          CurrentTime(),  // TransTime
          "admin" // UpdatedBy
      ];
      await client.query(updateHistoryQuery, txnHistoryParams);
      await client.query("COMMIT"); // Commit Transaction


        return encrypt(
            {
                success: true,
                message: "Subcategory inserted successfully.",
                data: allSubcategories.rows, // Return all subcategories
                token: tokens,
            },
            false
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
            false
        );
    } finally {
        client.release(); 
    }
  }
}