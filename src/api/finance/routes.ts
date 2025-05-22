import * as Hapi from "@hapi/hapi";
import IRoute from "../../helper/routes";
import { validateToken } from "../../helper/token";
import { Finance } from "./controller";

export class financeRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new Finance();
      server.route([
        {
          method: "GET",
          path: "/api/v1/Finance/viewFinance",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.viewFinanceReportV1,
            description: "view finance",
            tags: ["api", "finance"],
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/Finance/viewFullReport",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.viewFullReportV1,
            description: "view Past booking",
            tags: ["api", "users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/tracking/ViewTracking",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.viewTrackingV1,
            description: "view Past booking",
            tags: ["api", "users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/Finance/markPaid",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.updateFinanceReport,
            description: "view Past booking",
            tags: ["api", "users"],
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/Routes/viewDashboard",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.viewDashboardData,
            description: "view finance",
            tags: ["api", "finance"],
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
