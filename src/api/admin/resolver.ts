import { adminRepository } from "./adminRepository";

export class Resolver {
  public adminRepository: any;
  constructor() {
    this.adminRepository = new adminRepository();
  }
  public async addEmployeeV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.addEmployeeV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async adminloginV1(user_data: any, token_data: any): Promise<any> {
    return await this.adminRepository.adminloginV1(user_data, token_data);
  }
  public async getEmployeeV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.getEmployeeV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async getUsertypeV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.getUsertypeV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async viewProfileV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.viewProfileV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async addPartnersV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.addPartnersV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async updatePartnersV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.updatePartnersV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async getPartnersV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.getPartnersV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async getPartnerV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.getPartnerV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async deletePartnersV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.deletePartnersV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async addCustomerV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.addCustomerV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async getCustomersV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.getCustomersV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async updateCustomerV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.updateCustomerV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async getCustomerV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.getCustomerV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async deleteCustomerV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.deleteCustomerV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async addPricingV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.addPricingV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async getPricingV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.getPricingV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async addCategoryV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.addCategoryV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async getCategoryV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.getCategoryV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async addSubCategoryV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.addSubCategoryV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async getSubCategoryV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.getSubCategoryV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async resolveComplaintsResolverV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.resolveComplaintsRepoV1(
      user_data,
      token_data,
      domain_code
    );
  }
}
