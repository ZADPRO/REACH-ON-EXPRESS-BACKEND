import * as Hapi from "@hapi/hapi";
// import { Logger } from "winston";
import IRoute from "../../helper/routes";
import { validateToken } from "../../helper/token";
import validate from "./validate";
import { updateController } from "./controller";

export class updateRoutes implements IRoute {
    public async register(server: any): Promise<any> {
      return new Promise((resolve) => {
        const controller = new updateController();
        server.route([
          {
            method: "POST",
            path: "/api/v1/updateRoutes/updatePartners",
            config: {
              pre: [{ method: validateToken, assign: "token" }],
              handler: controller.updatePartners,
              validate: validate.updatePartners,
              description: "updatePartners",
              tags: ["api", "users"],
              auth: false,
            },
          },
          {
            method: "POST",
            path: "/api/v1/updateRoutes/updateCustomers",
            config: {
              pre: [{ method: validateToken, assign: "token" }],
              handler: controller.updateCustomers,
              validate: validate.updateCustomers,
              description: "updateCustomers",
              tags: ["api", "users"],
              auth: false,
            },
          },
          {
            method: "POST",
            path: "/api/v1/updateRoutes/updatePricing",
            config: {
              pre: [{ method: validateToken, assign: "token" }],
              handler: controller.updatePricing,
              validate: validate.updatePricing,
              description: "updateCustomers",
              tags: ["api", "users"],
              auth: false,
            },
          },
          {
            method: "POST",
            path: "/api/v1/updateRoutes/deletePartners",
            config: {
              pre: [{ method: validateToken, assign: "token" }],
              handler: controller.deletePartners,
              validate: validate.deletePartners,
              description: "deletePartners",
              tags: ["api", "users"],
              auth: false,
            },
          },
          {
            method: "POST",
            path: "/api/v1/updateRoutes/deleteCustomers",
            config: {
              pre: [{ method: validateToken, assign: "token" }],
              handler: controller.deleteCustomers,
              validate: validate.deleteCustomers,
              description: "deleteCustomers",
              tags: ["api", "users"],
              auth: false,
            },
          },{
            method: "POST",
            path: "/api/v1/updateRoutes/deletePricing",
            config: {
              pre: [{ method: validateToken, assign: "token" }],
              handler: controller.deletePricing,
              validate: validate.deletePricing,
              description: "deletePricing",
              tags: ["api", "users"],
              auth: false,
            },
          },
          
        
          
        ]);
        resolve(true);
      });
    }
  }