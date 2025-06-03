import { executeQuery, getClient } from "../../helper/db";
import { PoolClient } from "pg";
// import { storeFile, viewFile, deleteFile } from "../helper/storage";
import path from "path";
import { encrypt } from "../../helper/encrypt";
import { CurrentTime } from "../../helper/common";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import qs from "qs";
import { generateTokenWithExpire } from "../../helper/token";

import axios from "axios";
import logger from "../../helper/logger";

export class BatchRepository {
  public async parcelTrackingStatusUpdate(): Promise<any> {
    const client: PoolClient = await getClient();

    try {
      return encrypt(
        {
          success: true,
          message: "Parcel booking data inserted successfully",
        },
        true
      );
    } catch (error: unknown) {
      await client.query("ROLLBACK");
      return encrypt(
        {
          success: false,
          message: "Failed to insert parcel booking data",
          error: (error as Error).message,
        },
        true
      );
    } finally {
      client.release();
    }
  }
}
