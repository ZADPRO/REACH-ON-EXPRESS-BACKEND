import { newRepository } from "./newRepository";

export class Resolver {
  public newRepository: any;
  constructor() {
    this.newRepository = new newRepository();
  }
  public async userSignUpV1(user_data: any, domain_code: any): Promise<any> {
    return await this.newRepository.userSignUpV1(user_data, domain_code);
  }
  public async adminloginV1(user_data: any, token_data: any): Promise<any> {
    return await this.newRepository.adminloginV1(user_data, token_data);
  }
  public async addPartnersV1(user_data: any, token_data: any, domain_code: any,): Promise<any> {
    return await this.newRepository.addPartnersV1(user_data, token_data, domain_code);
  }
  public async updatePartnersV1(user_data: any, token_data: any, domain_code: any,): Promise<any> {
    return await this.newRepository.updatePartnersV1(user_data, token_data, domain_code);
  }
  public async deletePartnersV1(user_data: any, token_data: any, domain_code: any,): Promise<any> {
    return await this.newRepository.deletePartnersV1(user_data, token_data, domain_code);
  }
  public async addVendorV1(user_data: any, token_data: any, domain_code: any,): Promise<any> {
    return await this.newRepository.addVendorV1(user_data, token_data, domain_code);
  }
  public async updateVendorV1(user_data: any, token_data: any, domain_code: any,): Promise<any> {
    return await this.newRepository.updateVendorV1(user_data, token_data, domain_code);
  }
  public async deleteVendorV1(user_data: any, token_data: any, domain_code: any,): Promise<any> {
    return await this.newRepository.deleteVendorV1(user_data, token_data, domain_code);
  }
}