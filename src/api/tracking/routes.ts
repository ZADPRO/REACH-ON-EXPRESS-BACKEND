import * as Hapi from "@hapi/hapi";
// import { Logger } from "winston";
import IRoute from "../../helper/routes";
import { validateToken } from "../../helper/token";
import { tracking } from "./controller";
import validate from "./validate";

export class newRoutes implements IRoute {
    public async register(server: any): Promise<any> {
      return new Promise((resolve) => {
        const controller = new tracking();
        server.route([
          {
            method: "POST",
            path: "/api/v1/newRoutes/tracking",
            config: {
              pre: [{ method: validateToken, assign: "token" }],
              handler: controller.tracking,
              // validate: validate.tracking,
              description: "tracking",
              tags: ["api", "users"],
              auth: false,
            },
          },
          
        
          
        ]);
        resolve(true);
      });
    }
  }