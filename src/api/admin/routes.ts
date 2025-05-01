import * as Hapi from "@hapi/hapi";
// import { Logger } from "winston";
import IRoute from "../../helper/routes";
import { validateToken } from "../../helper/token";
import { Profile } from "./controller";
import validate from "./validate";

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
            validate: validate.addEmployee,
            description: "add employee",
            tags: ["api", "users"],
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/Routes/getEmployee",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.getEmployee,
            // validate: validate.getEmployee,
            description: "get Employee",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/Routes/getUsertype",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.getUsertype,
            description: "getUsertype",
            tags: ["api", "Users"],
            auth: false,
          },
        },

        {
          method: "POST",
          path: "/api/v1/Routes/viewProfile",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.viewProfile,
            // validate: validate.viewProfile,
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
            validate: validate.userLogin,
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
            // validate: validate.addPartners,
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
            // validate: validate.updatePartners,
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
            // validate: validate.getPartners,
            description: "view added Partners",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/Routes/deletePartners",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.deletePartners,
            // validate: validate.deletePartners,
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
            // validate: validate.addCustomer,
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
            // validate: validate.updateCustomer,
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
            // validate: validate.getCustomer,
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
            // validate: validate.deleteCustomer,
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
            // validate: validate.addPricing,
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
            // validate: validate.addCategory,
            description: "add category",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/Routes/getCategory",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.getCategory,
            description: "get category",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/Routes/addSubCategory",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addSubCategory,
            // validate: validate.addSubCategory,
            description: "add sub category",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/Routes/getSubCategory",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.getSubCategory,
            description: "get sub category",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
