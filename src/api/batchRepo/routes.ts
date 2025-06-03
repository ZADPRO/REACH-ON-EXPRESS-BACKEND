import * as Hapi from "@hapi/hapi";
// import { Logger } from "winston";
import IRoute from "../../helper/routes";
import { validateToken } from "../../helper/token";
import { BatchController } from "./controller";
import { resolve } from "path";

export class BatchProgramRoute implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new BatchController();
      server.route([
        {
          method: "GET",
          path: "/api/v1/batch/updateParcelStatus",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.parcelTrackingStatusUpdate,
            // validate: validate.parcelBooking,
            description: "booking ",
            tags: ["api", "users"],
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
