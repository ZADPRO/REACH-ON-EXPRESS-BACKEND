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
}
