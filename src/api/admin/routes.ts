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
          path: "/api/v1/Routes/addEmployee",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addEmployee,
            description: "add employee",
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
            description: "view profile",
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
          method: "GET",
          path: "/api/v1/Routes/getPartner",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.getPartner,
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
            description: "update partners",
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
            description: "view added products",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/Routes/deletePartners",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.deletePartners,
            description: "delete partners",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/Routes/addCustomer",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addCustomer,
            description: "add Customers",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/Routes/getCustomers",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.getCustomers,
            description: "view added Customer",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/Routes/updateCustomer",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.updateCustomer,
            description: "Update Customers",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/Routes/getCustomer",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.getCustomer,
            description: "view added products",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/Routes/deleteCustomer",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.deleteCustomer,
            description: "delete partners",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/Routes/addPricing",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addPricing,
            description: "add Pricing",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/Routes/getPricing",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.getPricing,
            description: "getPricing",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/Routes/addCategory",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addCategory,
            description: "add category",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/Routes/addSubCategory",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addSubCategory,
            description: "add sub category",
            auth: false,
          },
        },
        
        
      ]);
      resolve(true);
    });
  }
}