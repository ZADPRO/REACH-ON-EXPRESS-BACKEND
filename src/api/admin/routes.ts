import * as Hapi from "@hapi/hapi";
// import { Logger } from "winston";
import IRoute from "../../helper/routes";
import { validateToken } from "../../helper/token";
import { Profile } from "./controller";


export class newRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new Profile();
      server.route([
        {
          method: "POST",
          path: "/api/v1/Routes/Signup",
          config: {
            handler: controller.userSignUp,
            description: "Signup Checking Validation",
            tags: ["api", "users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/Routes/viewProfile",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.viewProfile,
            description: "add partners",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/Routes/login",
          config: {
            handler: controller.adminlogin,
            description: "login Checking Validation",
            // tags: ["api", "users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/Routes/addPartners",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addPartners,
            description: "add partners",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/Routes/updatePartners",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.updatePartners,
            description: "add partners",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/Routes/getPartners",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.getPartners,
            description: "adding products",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/Routes/deletePartners",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.deletePartners,
            description: "add partners",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/Routes/addVendor",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addVendor,
            description: "add vendors",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/Routes/updateVendor",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.updateVendor,
            description: "Update vendors",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "DELETE",
          path: "/api/v1/Routes/deleteVendor",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.deleteVendor,
            description: "add partners",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        
      ]);
      resolve(true);
    });
  }
}