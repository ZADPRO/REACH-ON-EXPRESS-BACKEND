import { mappingRepository } from "./mappingRepository";

export class mappingResolver {
  public mappingRepository: any;
  constructor() {
    this.mappingRepository = new mappingRepository();
  }
  public async AddTransactionMappingV1(user_data: any, token_data: any, domain_code: any,): Promise<any> {
    return await this.mappingRepository.AddTransactionMappingV1(user_data, token_data, domain_code);
  }
  public async transactionMappingV1(user_data: any, token_data: any, domain_code: any,): Promise<any> {
    return await this.mappingRepository.transactionMappingV1(user_data, token_data, domain_code);
  }

}