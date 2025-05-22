import * as Hapi from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { decodeToken } from "../../helper/token";
import { Resolver } from "./resolver";
import logger from "../../helper/logger";

export class Finance {
  public resolver: any;

  constructor() {
    this.resolver = new Resolver();
  }

  public viewFinanceReportV1 = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      let entity;
      entity = await this.resolver.viewFinanceReportV1(
        request.payload,
        decodeToken
      );
      if (entity.success) {
        return response.response(entity).code(201);
      }
      return response.response(entity).code(200);
    } catch (error) {
      return response
        .response({
          success: false,
          message: "An unknown error occurred in controller",
        })
        .code(500);
    }
  };

  public viewFullReportV1 = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      let entity;
      entity = await this.resolver.viewFullReportV1(
        request.payload,
        decodeToken
      );
      if (entity.success) {
        return response.response(entity).code(201);
      }
      return response.response(entity).code(200);
    } catch (error) {
      return response
        .response({
          success: false,
          message: "An unknown error occurred in controller",
        })
        .code(500);
    }
  };

  public viewTrackingV1 = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      let entity;
      entity = await this.resolver.viewTrackingV1(request.payload, decodeToken);
      if (entity.success) {
        return response.response(entity).code(201);
      }
      return response.response(entity).code(200);
    } catch (error) {
      return response
        .response({
          success: false,
          message: "An unknown error occurred in controller",
        })
        .code(500);
    }
  };

  public updateFinanceReport = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      let entity;
      entity = await this.resolver.updateFinanceReport(
        request.payload,
        decodeToken
      );
      if (entity.success) {
        return response.response(entity).code(201);
      }
      return response.response(entity).code(200);
    } catch (error) {
      return response
        .response({
          success: false,
          message: "An unknown error occurred in controller",
        })
        .code(500);
    }
  };

  public viewDashboardData = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      let entity;
      entity = await this.resolver.viewDashboardData(
        request.payload,
        decodeToken
      );
      if (entity.success) {
        return response.response(entity).code(201);
      }
      return response.response(entity).code(200);
    } catch (error) {
      return response
        .response({
          success: false,
          message: "An unknown error occurred in controller",
        })
        .code(500);
    }
  };
}
