import * as Hapi from "@hapi/hapi";
// import { Logger } from "winston";
import IRoute from "../../helper/routes";
import { validateToken } from "../../helper/token";
import { booking } from "./controller";
import validate from "./validate";

export class bookingRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new booking();
      server.route([
        {
          method: "POST",
          path: "/api/v1/route/bookingTest",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.parcelBooking,
            validate: validate.parcelBooking,
            description: "booking ",
            tags: ["api", "users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/route/updateBooking",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.updateBooking,
            // validate: validate.updateBooking,
            description: "update Booking ",
            tags: ["api", "users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/route/viewBooking",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.viewBooking,
            // validate: validate.viewBooking,
            description: "view booking",
            tags: ["api", "users"],
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/route/viewPastBooking",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.viewPastBooking,
            description: "view Past booking",
            tags: ["api", "users"],
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/route/paymentMode",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.paymentMode,
            description: "paymentMode",
            tags: ["api", "users"],
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/route/addReport",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addReport,
            description: "add Report",
            tags: ["api", "users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/route/updateFinance",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.updateFinance,
            // validate: validate.updateFinance,
            description: "view booking",
            tags: ["api", "users"],
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
