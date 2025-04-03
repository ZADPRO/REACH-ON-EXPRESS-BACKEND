import { trackingRepository } from "./trackingRepository";

export class Resolver {
  public trackingRepository: any;
  constructor() {
    this.trackingRepository = new trackingRepository();
  }

  public async trackingV1(user_data: any, token_data: any, domain_code: any,): Promise<any> {
    return await this.trackingRepository.trackingV1(user_data, token_data, domain_code);
  }

}