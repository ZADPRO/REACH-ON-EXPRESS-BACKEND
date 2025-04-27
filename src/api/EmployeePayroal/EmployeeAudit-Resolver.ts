import { executeQuery, getClient } from "../../helper/db";
import { PoolClient } from "pg";
import moment from "moment"; // Fix the import issue

// import { storeFile, viewFile, deleteFile } from "../helper/storage";
import path from "path";
import { encrypt } from "../../helper/encrypt";
import { CurrentTime } from "../../helper/common";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateTokenWithExpire } from "../../helper/token";
import { getPayedList, getUnpaidEmployeeList, insertSalaryData } from "./query";

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
          data:data,
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
          token: tokens
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
          data: data
        },
        true
      );
    } catch (error: unknown) {
      return encrypt(
        {
          success: false,
          message: "Failed to Getting Teh Employee Payed List",
          error: (error as Error).message,
          token: tokens
        },
        true
      );
    }
  }
}
