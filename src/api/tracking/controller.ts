import * as Hapi from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { decodeToken } from "../../helper/token"
import { Resolver } from "./resolver";
import logger from "../../helper/logger";

export class tracking {
  public resolver: any;

  constructor() {
    this.resolver = new Resolver();
  }
  public tracking = async (
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
        entity = await this.resolver.trackingV1(request.payload,decodedToken);
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
  
}
