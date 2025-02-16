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
}
