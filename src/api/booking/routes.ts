import * as Hapi from "@hapi/hapi";
// import { Logger } from "winston";
import IRoute from "../../helper/routes";
import { validateToken } from "../../helper/token";
import { booking } from "./controller";

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
            description: "booking ",
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
      ]);
      resolve(true);
    });
  }
}
