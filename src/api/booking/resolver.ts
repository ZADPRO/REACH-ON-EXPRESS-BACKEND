import { bookingRepository } from "./bookingRepository";

export class bookingResolver {
  public adminRepository: any;
  constructor() {
    this.adminRepository = new bookingRepository();
  }
  public async parcelBookingV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.parcelBookingV1(
      user_data,
      token_data,
      domain_code
    );
  }

  public async UpdateBulkParcelBookingDataV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.UpdateBulkParcelBookingDataV1(
      user_data,
      token_data,
      domain_code
    );
  }

  public async FetchBulkMappedParcelData(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.FetchBulkMappedParcelData(
      user_data,
      token_data,
      domain_code
    );
  }

  public async updateBookingV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.updateBookingV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async viewBookingV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.viewBookingV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async viewPastBookingV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.viewPastBookingV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async paymentModeV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.paymentModeV1(
      user_data,
      token_data,
      domain_code
    );
  }

  public async addReportV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.addReportV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async updateFinanceV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.updateFinanceV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async listFinanceV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.listFinanceV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async addreportDataV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.adminRepository.addreportDataV1(
      user_data,
      token_data,
      domain_code
    );
  }
}
