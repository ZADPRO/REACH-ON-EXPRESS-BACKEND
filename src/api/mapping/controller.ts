import * as Hapi from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { decodeToken } from "../../helper/token"
import { mappingResolver } from "./resolver";
import logger from "../../helper/logger";

export class mapping {
  public resolver: any;
  constructor() {
    this.resolver = new mappingResolver();
  }
  public AddTransactionMapping = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info("Router ------------insert transaction Mapping ");
    try {
      const decodedToken ={
        id:request.plugins.token.id
      }
      let entity;
      entity = await this.resolver.AddTransactionMappingV1(request.payload, decodedToken);
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in insert transaction Mapping:", error);
      return response
        .response({
          success: false,
          message: "An unknown error occurred in controller",
        })
        .code(500);
    }
  }
 public transactionMapping = async (
     request: any,
     response: Hapi.ResponseToolkit
   ): Promise<any> => {
     logger.info("Router ------------transaction Mapping ");
     try {
      //  const decodedToken ={
      //    id:request.plugins.token.id
      //  }
       const decodedToken ={
        id:request.plugins.token.id
      }
       
       let entity;
       entity = await this.resolver.transactionMappingV1(request.payload, decodedToken);
       if (entity.success) {
         return response.response(entity).code(201); // Created
       }
       return response.response(entity).code(200); // Bad Request if failed
     } catch (error) {
       logger.error("Error in transaction Mapping:", error);
       return response
         .response({
           success: false,
           message: "An unknown error occurred in controller",
         })
         .code(500);
     }
   }
}
