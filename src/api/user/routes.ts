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
        {
          method: "POST",
          path: "/api/v1/userRoutes/raiseRequest",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.raiseRequestV1,
            description: "updatePartners",
            tags: ["api", "users"],
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/UserRoutes/getAllRequests",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.getAllRequestV1,
            description: "updatePartners",
            tags: ["api", "users"],
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/UserRoutes/getAllRequestId",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.getAllRequestV1,
            description: "updatePartners",
            tags: ["api", "users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/userRoutes/raiseComplaint",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.raiseComplaintV1,
            description: "updatePartners",
            tags: ["api", "users"],
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/UserRoutes/getAllComplaints",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.getAllComplaintsV1,
            description: "updatePartners",
            tags: ["api", "users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/UserRoutes/userParcelDet",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userParDetV1,
            description: "updatePartners",
            tags: ["api", "users"],
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/UserRoutes/parcelDetails/{parcelId}",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.indivParcelDetailsV1,
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
