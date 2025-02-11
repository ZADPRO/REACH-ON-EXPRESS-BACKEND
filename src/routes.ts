import * as Hapi from "@hapi/hapi";
import { newRoutes } from "./api/admin/routes";
import { bookingRoutes } from "./api/booking/routes";


export default class Router {
  public static async loadRoutes(server: Hapi.Server): Promise<any> {
    await new newRoutes().register(server);
    await new bookingRoutes().register(server)
  }
}