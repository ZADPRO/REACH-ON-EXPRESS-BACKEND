import * as Hapi from "@hapi/hapi";
import { newRoutes } from "./api/admin/routes";
import { bookingRoutes } from "./api/booking/routes";
import { mappingRoutes } from "./api/mapping/routes";
import { EmployeePayAuditRoutes } from "./api/EmployeePayroal/routes";
import { updateRoutes } from "./api/update/routes";

export default class Router {
  public static async loadRoutes(server: Hapi.Server): Promise<any> {
    await new newRoutes().register(server);
    await new bookingRoutes().register(server);
    await new mappingRoutes().register(server);
    await new EmployeePayAuditRoutes().register(server);
    await new updateRoutes().register(server);

  }
}
