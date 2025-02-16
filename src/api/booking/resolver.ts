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
}
