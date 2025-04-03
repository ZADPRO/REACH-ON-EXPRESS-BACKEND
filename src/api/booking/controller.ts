import * as Hapi from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { decodeToken } from "../../helper/token";
import { bookingResolver } from "./resolver";
import logger from "../../helper/logger";

export class booking {
  public resolver: any;

  constructor() {
    this.resolver = new bookingResolver();
  }
  public parcelBooking = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router ------------booking ");
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      // const decodedToken = {
      //   id: 1,
      // };

      let entity;
      entity = await this.resolver.parcelBookingV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in booking:", error);
      return response
        .response({
          success: false,
          message: "An unknown error occurred in controller",
        })
        .code(500);
    }
  };
  public updateBooking = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router ------------update Booking ");
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      

      let entity;
      entity = await this.resolver.updateBookingV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in update Booking:", error);
      return response
        .response({
          success: false,
          message: "An unknown error occurred in controller",
        })
        .code(500);
    }
  };
  public viewBooking = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router ------------view booking ");
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };

      let entity;
      entity = await this.resolver.viewBookingV1(request.payload, decodedToken);
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in view booking:", error);
      return response
        .response({
          success: false,
          message: "An unknown error occurred in controller",
        })
        .code(500);
    }
  };

  public viewPastBooking = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router ------------view Past booking ");
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      // const decodedToken = {
      //   id: 1,
      // };

      let entity;
      entity = await this.resolver.viewPastBookingV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in view Past booking:", error);
      return response
        .response({
          success: false,
          message: "An unknown error occurred in controller",
        })
        .code(500);
    }
  };
  public paymentMode = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router ------------payment Mode ");
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      

      let entity;
      entity = await this.resolver.paymentModeV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in view payment Mode", error);
      return response
        .response({
          success: false,
          message: "An unknown error occurred in controller",
        })
        .code(500);
    }
  };
  public addReport = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router ------------add Report ");
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      let entity;
      entity = await this.resolver.addReportV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in add Report", error);
      return response
        .response({
          success: false,
          message: "An unknown error occurred in controller",
        })
        .code(500);
    }
  };
  public updateFinance = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router ------------update Finance");
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      let entity;
      entity = await this.resolver.updateFinanceV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in update Finance", error);
      return response
        .response({
          success: false,
          message: "An unknown error occurred in controller",
        })
        .code(500);
    }
  };
  public listFinance = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router ------------list Finance");
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      let entity;
      entity = await this.resolver.listFinanceV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in list Finance", error);
      return response
        .response({
          success: false,
          message: "An unknown error occurred in controller",
        })
        .code(500);
    }
  };
}
