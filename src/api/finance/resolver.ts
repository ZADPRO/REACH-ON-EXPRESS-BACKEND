import { financeRepository } from "./financeRepository";

export class Resolver {
  public financeRepository: any;
  constructor() {
    this.financeRepository = new this.financeRepository();
  }

  public async addPartnersV1(user_data: any, token_data: any, domain_code: any,): Promise<any> {
    return await this.financeRepository.addPartnersV1(user_data, token_data, domain_code);
  }

}