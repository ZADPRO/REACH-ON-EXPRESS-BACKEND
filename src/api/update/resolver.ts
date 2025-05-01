import { updateRepository } from "./update-repository";

export class updateResolver {
  public updateRepository: any;
  constructor() {
    this.updateRepository = new updateRepository();
  }

  public async updatePartnersV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.updateRepository.updatePartnersV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async updateCustomersV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.updateRepository.updateCustomersV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async updatePricingV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.updateRepository.updatePricingV1(
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
    return await this.updateRepository.deletePartnersV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async deleteCustomersV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.updateRepository.deleteCustomersV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async deletePricingV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.updateRepository.deletePricingV1(
      user_data,
      token_data,
      domain_code
    );
  }
}
