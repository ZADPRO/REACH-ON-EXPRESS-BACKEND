import * as Hapi from "@hapi/hapi";
// import { Logger } from "winston";
import IRoute from "../../helper/routes";
import { validateToken } from "../../helper/token";
import { finance } from "./controller";

export class newRoutes implements IRoute {
    public async register(server: any): Promise<any> {
      return new Promise((resolve) => {
        const controller = new finance();
        server.route([
          {
            method: "POST",
            // path: "/api/v1/Routes/Signup",
            config: {
            //   handler: controller.userSignUp,
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