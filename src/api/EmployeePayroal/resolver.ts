import { EmployeeAuditRepository } from "./EmployeeAudit-Resolver";

export class EmployeeAuditResolver {
  public EmployeeAuditRepository: any;
  constructor() {
    this.EmployeeAuditRepository = new EmployeeAuditRepository();
  }
  public async ListUnpaidEmployeeV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.EmployeeAuditRepository.ListUnpaidEmployeeV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async insertSalaryDataV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.EmployeeAuditRepository.insertSalaryDataV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async payedListV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.EmployeeAuditRepository.payedListV1(
      user_data,
      token_data,
      domain_code
    );
  }
}
