import * as Hapi from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { decodeToken } from "../../helper/token";
import logger from "../../helper/logger";
import { updateResolver } from "./resolver";

export class updateController {
  public resolver: any;

  constructor() {
    this.resolver = new updateResolver();
  }
  public updatePartners = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router-----update Partners");
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      console.log("decodedToken", decodedToken);
      let entity;
      entity = await this.resolver.updatePartnersV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in update partner", error);
      return response
        .response({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        })
        .code(500);
    }
  };
  public updateCustomers = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router-----updateCustomers");
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      console.log("decodedToken", decodedToken);
      let entity;
      entity = await this.resolver.updateCustomersV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in updateCustomers", error);
      return response
        .response({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        })
        .code(500);
    }
  };
  public updatePricing = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router-----updatePricing");
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      console.log("decodedToken", decodedToken);
      let entity;
      entity = await this.resolver.updatePricingV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in updatePricing", error);
      return response
        .response({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        })
        .code(500);
    }
  };
  public deletePartners = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router-----deletePartners");
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      console.log("decodedToken", decodedToken);
      let entity;
      entity = await this.resolver.deletePartnersV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in deletePartners", error);
      return response
        .response({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        })
        .code(500);
    }
  };
  public deleteCustomers = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router-----deleteCustomers");
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      console.log("decodedToken", decodedToken);
      let entity;
      entity = await this.resolver.deleteCustomersV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in deleteCustomers", error);
      return response
        .response({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        })
        .code(500);
    }
  };
  public deletePricing = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router-----deletePricing");
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      console.log("decodedToken", decodedToken);
      let entity;
      entity = await this.resolver.deletePricingV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in deletePricing", error);
      return response
        .response({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        })
        .code(500);
    }
  };
}
