import { bookingRepository } from "./bookingRepository";

export class Resolver {
  public bookingRepository: any;
  constructor() {
    this.bookingRepository = new this.bookingRepository();
  }

  public async addPartnersV1(user_data: any, token_data: any, domain_code: any,): Promise<any> {
    return await this.bookingRepository.addPartnersV1(user_data, token_data, domain_code);
  }

}