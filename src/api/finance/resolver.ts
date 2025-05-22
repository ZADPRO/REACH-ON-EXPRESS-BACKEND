import { FinanceRepository } from "./financeRepository";

export class Resolver {
  public financeRepository: any;
  constructor() {
    this.financeRepository = new FinanceRepository();
  }

  public async viewFinanceReportV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.financeRepository.viewFinanceReportV1(
      user_data,
      token_data,
      domain_code
    );
  }

  public async viewFullReportV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.financeRepository.viewFullReportV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async viewTrackingV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.financeRepository.viewTrackingV1(
      user_data,
      token_data,
      domain_code
    );
  }

  public async updateFinanceReport(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.financeRepository.updateFinanceReport(
      user_data,
      token_data,
      domain_code
    );
  }

  public async viewDashboardData(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.financeRepository.viewDashboardData(
      user_data,
      token_data,
      domain_code
    );
  }
}
