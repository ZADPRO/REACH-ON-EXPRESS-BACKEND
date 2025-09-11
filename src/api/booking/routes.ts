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
            // validate: validate.parcelBooking,
            description: "booking ",

            tags: ["api", "users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/route/bulkUpdateBooking",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.UpdateBulkParcelBookingDataV1,
            // validate: validate.parcelBooking,
            description: "booking ",

            tags: ["api", "users"],
            auth: false,
            payload: {
              maxBytes: 50 * 1024 * 1024, // 50MB limit
              output: "data", // Required if you're expecting a JSON body
              parse: true,
            },
          },
        },

        {
          method: "GET",
          path: "/api/v1/route/fetchAllMappingData",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.FetchBulkMappedParcelData,
            // validate: validate.parcelBooking,
            description: "booking ",
            tags: ["api", "users"],
            auth: false,
          },
        },

        {
          method: "GET",
          path: "/api/v1/route/fetchPendingMappingData",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.FetchPendingData,
            // validate: validate.parcelBooking,
            description: "booking ",
            tags: ["api", "users"],
            auth: false,
          },
        },

        {
          method: "POST",
          path: "/api/v1/route/updatePendingData",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.UpdatePendingData,
            // validate: validate.parcelBooking,
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
        {
          method: "GET",
          path: "/api/v1/route/listFinance",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.listFinance,
            description: "listFinance",
            tags: ["api", "users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/route/addreportData",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addreportData,
            // validate: validate.addreportData,
            description: "view booking",
            tags: ["api", "users"],
            auth: false,
          },
        },

        // COMPLAINT
        {
          method: "GET",
          path: "/api/v1/route/complaints",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.getAllComplaints,
            // validate: validate.addreportData,
            description: "complaint retrieve",
            tags: ["api", "users"],
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
