import * as Hapi from "@hapi/hapi";
// import { Logger } from "winston";
import IRoute from "../../helper/routes";
import { validateToken } from "../../helper/token";
import { EmployeeAudit } from "./controller";

export class EmployeePayAuditRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new EmployeeAudit();
      server.route([
        {
          method: "POST",
          path: "/api/v1/Employee/ListUnpaidEmployee",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.ListUnpaidEmployee,
            // validate: validate.AddTransactionMapping,
            description: "Add Transaction Mapping",
            tags: ["api", "users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/Employee/insertSalaryData",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.insertSalaryData,
            // validate: validate.AddTransactionMapping,
            description: "Add Transaction Mapping",
            tags: ["api", "users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/Employee/payedList",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.payedList,
            // validate: validate.AddTransactionMapping,
            description: "Add Transaction Mapping",
            tags: ["api", "users"],
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
