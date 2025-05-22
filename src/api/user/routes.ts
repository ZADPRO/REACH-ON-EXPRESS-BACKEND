import * as Hapi from "@hapi/hapi";
// import { Logger } from "winston";
import IRoute from "../../helper/routes";
import { validateToken } from "../../helper/token";

import { UserController } from "./controller";

export class UserRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new UserController();
      server.route([
        {
          method: "POST",
          path: "/api/v1/userRoutes/userLogin",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userLoginV1,
            description: "updatePartners",
            tags: ["api", "users"],
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/UserRoutes/userDetails",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userParcelDetailsV1,
            description: "updatePartners",
            tags: ["api", "users"],
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
