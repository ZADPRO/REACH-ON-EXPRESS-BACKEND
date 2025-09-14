import * as Hapi from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { decodeToken } from "../../helper/token";
import logger from "../../helper/logger";

import { UserReporesolver } from "./resolver";

export class UserController {
  public resolver: any;
  constructor() {
    this.resolver = new UserReporesolver();
  }
  public userLoginV1 = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router--------user login controller");
    try {
      let entity;
      entity = await this.resolver.userLoginV1(request.payload);
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in user login", error);
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

  public userParcelDetailsV1 = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router--------user login controller");
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      let entity;
      entity = await this.resolver.userParcelDetailsV1(
        request.query,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in user login", error);
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

  public raiseRequestV1 = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router--------user raise request controller");
    try {
      console.log("request", request.plugins.token);
      const decodedToken = {
        id: request.plugins.token.id,
      };
      console.log("decodedToken", decodedToken);
      let entity;
      entity = await this.resolver.raiseRequestV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        console.log("entity", entity);
        return response.response(entity).code(201); // Created
      }
      console.log("response", response);
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in user login", error);
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

  public getAllRequestV1 = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router--------user reqwust controller");
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      let entity;
      entity = await this.resolver.getAllRequestV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in user login", error);
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

  public getAllRequestIdV1 = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router--------user reqwust controller");
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      let entity;
      entity = await this.resolver.getAllRequestIdV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in user login", error);
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

  public raiseComplaintV1 = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router--------user login controller");
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      let entity;
      entity = await this.resolver.raiseComplaintV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in user login", error);
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

  public getAllComplaintsV1 = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router--------user reqwust controller");
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      let entity;
      entity = await this.resolver.getAllComplaintsV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in user login", error);
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

  public userParDetV1 = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router--------user parcel data controller");
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      let entity;
      entity = await this.resolver.userParDetV1(request.payload, decodedToken);
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in user login", error);
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

  public indivParcelDetailsV1 = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router--------user parcel data controller");
    try {
      const decodedToken = { id: request.plugins.token.id };

      const entity = await this.resolver.indivParcelDetailsV1(
        { parcelId: request.params.parcelId }, // pass parcelId
        decodedToken
      );

      if (entity.success) {
        return response.response(entity).code(201);
      }
      return response.response(entity).code(200);
    } catch (error) {
      logger.error("Error in indivParcelDetails", error);
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
