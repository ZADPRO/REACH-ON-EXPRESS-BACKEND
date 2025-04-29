import * as Hapi from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { decodeToken } from "../../helper/token";
import { EmployeeAuditResolver } from "./resolver";
import logger from "../../helper/logger";

export class EmployeeAudit {
  public resolver: any;
  constructor() {
    this.resolver = new EmployeeAuditResolver();
  }
  public ListUnpaidEmployee = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(
      "Router -----------Listing the Unpaid Employee For the Selected Month "
    );
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      // const decodedToken = {
      //   id: 1,
      // };
      let entity;
      entity = await this.resolver.ListUnpaidEmployeeV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error(
        "Error in Listing the Unpaid Employee For the Selected Month:",
        error
      );
      return response
        .response({
          success: false,
          message: "An unknown error occurred in controller",
        })
        .code(500);
    }
  };
  public insertSalaryData = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router -----------Inserting The New Salary Data");
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      // const decodedToken = {
      //   id: 1,
      // };
      let entity;
      entity = await this.resolver.insertSalaryDataV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in Inserting The New Salary Data:", error);
      return response
        .response({
          success: false,
          message: "An unknown error occurred in controller",
        })
        .code(500);
    }
  };
  public payedList = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router -----------Getting Payed List");
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      // const decodedToken = {
      //   id: 1,
      // };
      let entity;
      entity = await this.resolver.payedListV1(request.payload, decodedToken);
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in Getting Payed List : ", error);
      return response
        .response({
          success: false,
          message: "An unknown error occurred in controller",
        })
        .code(500);
    }
  };

  public checkApi = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router -----------Getting Payed List");
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      // const decodedToken = {
      //   id: 1,
      // };
      let entity;
      entity = await this.resolver.checkApiV1(request.payload, decodedToken);
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in Getting Payed List : ", error);
      return response
        .response({
          success: false,
          message: "An unknown error occurred in controller",
        })
        .code(500);
    }
  };
}
