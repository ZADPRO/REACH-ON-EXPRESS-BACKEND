import * as Hapi from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { decodeToken } from "../../helper/token"
import { Resolver } from "./resolver";
import logger from "../../helper/logger";

export class Profile {
  public resolver: any;

  constructor() {
    this.resolver = new Resolver();
  }
  public addEmployee = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router ------------signUp");
    try {
      const decodedToken ={
        id:request.plugins.token.id
      }
      let entity;
      entity = await this.resolver.addEmployeeV1(request.payload, decodedToken);
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in userSignUp:", error);
      return response
        .response({
          success: false,
          message: "An unknown error occurred in controller",
        })
        .code(500);
    }
  }
  public viewProfile = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router ------------view profile");
    try {
      const decodedToken ={
        id:request.plugins.token.id
      }
      let entity;
      entity = await this.resolver.viewProfileV1(request.payload,decodedToken);
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in view profile:", error);
      return response
        .response({
          success: false,
          message: "An unknown error occurred in view profile",
        })
        .code(500);
    }
  }
  public adminlogin = async (
    request: Hapi.Request,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router ------------admin login");
    try {
      let entity;
      entity = await this.resolver.adminloginV1(request.payload);

      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in Admin:", error);
      return response
        .response({
          success: false,
          message: "An unknown error occurred",
        })
        .code(500);
    }
  }
  public addPartners = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router-----add partner");
    try {
      const decodedToken ={
        id:request.plugins.token.id
      }
      console.log('decodedToken', decodedToken)
      let entity;
      entity = await this.resolver.addPartnersV1(request.payload,decodedToken);
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed

    } catch (error) {
      logger.error("Error in add partner", error);
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
  public updatePartners = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router-----update partner");
    try {
      const decodedToken ={
        id:request.plugins.token.id
      }
      let entity;
      entity = await this.resolver.updatePartnersV1(request.payload,decodedToken);
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
  public getPartners = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    const decodedToken ={
      id:request.plugins.token.id
    }
    console.log('decodedToken', decodedToken)
    logger.info("Router-----get partners");
    try {
      let entity;
      entity = await this.resolver.getPartnersV1(request.payload,decodedToken);
      console.log('request.payload---------------------------------------------------', request.payload)

      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed

    } catch (error) {
      logger.error("Error in getting offers", error);
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
    logger.info("Router-----delete partner");
    try {
      let entity;
      entity = await this.resolver.deletePartnersV1(request.payload);
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed

    } catch (error) {
      logger.error("Error in delete partner", error);
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
  public addCustomer = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router-----add Customer");
    try {
      const decodedToken ={
        id:request.plugins.token.id
      }
      let entity;
      entity = await this.resolver.addCustomerV1(request.payload,decodedToken);
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed

    } catch (error) {
      logger.error("Error in add Customer", error);
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
  public updateCustomer = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router-----update Customer");
    try {
      let entity;
      entity = await this.resolver.updateCustomerV1(request.payload);
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed

    } catch (error) {
      logger.error("Error in update Customer", error);
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
  public getCustomer = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    const decodedToken ={
      id:request.plugins.token.id
    }
    console.log('decodedToken', decodedToken)
    logger.info("Router-----get partners");
    try {
      let entity;
      entity = await this.resolver.getCustomerV1(request.payload,decodedToken);

      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed

    } catch (error) {
      logger.error("Error in getting customer", error);
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
  public deleteCustomer = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router-----delete Customer");
    try {
      let entity;
      entity = await this.resolver.deleteCustomerV1(request.payload);
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed

    } catch (error) {
      logger.error("Error in delete Customer", error);
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
  public addPricing = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router-----add price");
    try {
      const decodedToken ={
        id:request.plugins.token.id
      }
      let entity;
      entity = await this.resolver.addPricingV1(request.payload,decodedToken);
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed

    } catch (error) {
      logger.error("Error in add price", error);
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
  public addCategory = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router-----add category");
    try {
      const decodedToken ={
        id:request.plugins.token.id
      }
      let entity;
      entity = await this.resolver.addCategoryV1(request.payload,decodedToken);
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed

    } catch (error) {
      logger.error("Error in add category", error);
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
  public addSubCategory = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router-----add Sub category");
    try {
      const decodedToken ={
        id:request.plugins.token.id
      }
      let entity;
      entity = await this.resolver.addSubCategoryV1(request.payload,decodedToken);
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed

    } catch (error) {
      logger.error("Error in add sub category", error);
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
