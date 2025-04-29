import qs from "qs";
import axios from "axios";
import Base64 from "crypto-js/enc-base64";
import hmacSHA256 from "crypto-js/hmac-sha256";

export default class Payrexx {
  private instance: string;
  private secret: string;
  private baseUrl: string;

  constructor(
    instance: string,
    secret: string,
    baseUrl: string = "https://api.payrexx.com/v1.0/"
  ) {
    this.instance = instance;
    this.secret = secret;
    this.baseUrl = baseUrl;
  }

  private buildSignature(data?: Record<string, any>): string {
    let queryStr = "";
    if (data) {
      queryStr = qs.stringify(data, { format: "RFC1738" });
      queryStr = queryStr.replace(
        /[!'()*~]/g,
        (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
      );
    }
    return Base64.stringify(hmacSHA256(queryStr, this.secret));
  }

  private buildBaseUrl(path: string): string {
    return `${this.baseUrl}${path}?instance=${this.instance}`;
  }

  async get(endpoint: string, id: number | string): Promise<any> {
    const baseUrl = this.buildBaseUrl(`${endpoint}/${id}/`);
    const url = `${baseUrl}&ApiSignature=${this.buildSignature()}`;
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error: any) {
      return (
        error.response?.data || { status: "error", message: error.message }
      );
    }
  }

  async getAll(endpoint: string): Promise<any> {
    const baseUrl = this.buildBaseUrl(`${endpoint}/`);
    const url = `${baseUrl}&ApiSignature=${this.buildSignature()}`;
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error: any) {
      return (
        error.response?.data || { status: "error", message: error.message }
      );
    }
  }

  async post(endpoint: string, data: Record<string, any>): Promise<any> {
    data.ApiSignature = this.buildSignature(data);
    const queryStr = qs.stringify(data);

    const baseUrl = this.buildBaseUrl(`${endpoint}/`);
    try {
      const response = await axios.post(baseUrl, queryStr, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      return response.data;
    } catch (error: any) {
      return (
        error.response?.data || { status: "error", message: error.message }
      );
    }
  }
}
