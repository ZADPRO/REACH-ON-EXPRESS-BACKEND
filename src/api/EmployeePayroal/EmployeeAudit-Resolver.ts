import { executeQuery, getClient } from "../../helper/db";
import { PoolClient } from "pg";
import moment from "moment"; // Fix the import issue

import axios from "axios";
// import { storeFile, viewFile, deleteFile } from "../helper/storage";
import path from "path";
import { encrypt } from "../../helper/encrypt";
import { CurrentTime } from "../../helper/common";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateTokenWithExpire } from "../../helper/token";
import { getPayedList, getUnpaidEmployeeList, insertSalaryData } from "./query";
import Payrexx from "./Payrexx";

export class EmployeeAuditRepository {
  public async ListUnpaidEmployeeV1(
    userData: any,
    tokendata: any
  ): Promise<any> {
    const token = { id: tokendata.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
      const data = await executeQuery(getUnpaidEmployeeList, [userData.month]);

      return encrypt(
        {
          success: true,
          message: "Transaction mapping inserted successfully",
          token: tokens,
          data: data,
        },
        true
      );
    } catch (error: unknown) {
      return encrypt(
        {
          success: false,
          message: "Failed to insert transaction mapping",
          error: (error as Error).message,
          token: tokens,
        },
        true
      );
    }
  }
  public async insertSalaryDataV1(userData: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
      const params = [
        userData.employeeIds,
        CurrentTime(),
        userData.salaryMonth,
        tokendata.id,
      ];
      const data = await executeQuery(insertSalaryData, params);

      return encrypt(
        {
          success: true,
          message: "New Month Employee Payed Successfully",
          data: data,
          token: tokens,
        },
        true
      );
    } catch (error: unknown) {
      return encrypt(
        {
          success: false,
          message: "Failed to insert New Month Employee Payed",
          error: (error as Error).message,
          token: tokens,
        },
        true
      );
    }
  }
  public async payedListV1(userData: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id };
    const tokens = generateTokenWithExpire(token, true);

    try {
      const params = [userData.month];
      const data = await executeQuery(getPayedList, params);

      return encrypt(
        {
          success: true,
          message: "Employee Payed List passed Successfully",
          token: tokens,
          data: data,
        },
        true
      );
    } catch (error: unknown) {
      return encrypt(
        {
          success: false,
          message: "Failed to Getting Teh Employee Payed List",
          error: (error as Error).message,
          token: tokens,
        },
        true
      );
    }
  }

  public async checkApiV1(userData: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id };
    const tokens = generateTokenWithExpire(token, true);

    const payrexx = new Payrexx(
      "explorevacationsag",
      "vqdTdCezHYCNEzgFcRsPz4PwvYvZPV"
    );

    try {
      // Send payment request to Payrexx
      const result = await payrexx.post("Gateway", {
        amount: 100,
        currency: "CHF",
        vatRate: 7.7,
        purpose: "Test Payment", // Example purpose
        psp: [44, 36],
        pm: ["visa", "mastercard", "twint", "amex"],
        fields: {
          email: { value: "mailtothirukumara.com" },
          forename: { value: "Max" },
          surname: { value: "Muster" },
        },
      });

      console.log("Payrexx API Response:", result);

      // Ensure the response has the necessary fields
      if (result && result.status && result.data) {
        return encrypt(
          {
            success: true,
            message: "Employee Payed List passed successfully",
            token: tokens,
            data: result.data, // Assuming result.data contains the payment link and other details
          },
          true
        );
      } else {
        throw new Error("Payrexx response does not contain expected data");
      }
    } catch (error) {
      console.error("Error in Payrexx API call:", error);

      return encrypt(
        {
          success: false,
          message: "Failed to create payment link",
          error: error || "Unknown error",
          token: tokens,
        },
        true
      );
    }
  }
}
