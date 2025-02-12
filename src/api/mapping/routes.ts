import * as Hapi from "@hapi/hapi";
// import { Logger } from "winston";
import IRoute from "../../helper/routes";
import { validateToken } from "../../helper/token";
import { mapping } from "./controller";

export class mappingRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new mapping();
      server.route([
        {
          method: "POST",
          path: "/api/v1/routes/addMapping",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.AddTransactionMapping,
            description: "Signup Checking Validation",
            tags: ["api", "users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/routes/mapping",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.transactionMapping,
            description: "Signup Checking Validation",
            tags: ["api", "users"],
            auth: false,
          },
        },


      ]);
      resolve(true);
    });
  }
}