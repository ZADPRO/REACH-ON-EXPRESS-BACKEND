import { UserRepo } from "./user";

export class UserReporesolver {
  public userRepo: any;
  constructor() {
    this.userRepo = new UserRepo();
  }

  public async userLoginV1(userData: any, tokenData?: any): Promise<any> {
    return await this.userRepo.userLoginV1(userData, tokenData);
  }

  public async userParcelDetailsV1(
    userData: any,
    tokenData?: any
  ): Promise<any> {
    return await this.userRepo.userParcelDetailsV1(userData, tokenData);
  }

  public async raiseRequestV1(userData: any, tokenData?: any): Promise<any> {
    return await this.userRepo.raiseRequestV1(userData, tokenData);
  }

  public async getAllRequestV1(userData: any, tokenData?: any): Promise<any> {
    return await this.userRepo.getAllRequestV1(userData, tokenData);
  }

  public async getAllRequestIdV1(userData: any, tokenData?: any): Promise<any> {
    return await this.userRepo.getAllRequestIdV1(userData, tokenData);
  }

  public async raiseComplaintV1(userData: any, tokenData?: any): Promise<any> {
    return await this.userRepo.raiseComplaintV1(userData, tokenData);
  }

  public async getAllComplaintsV1(
    userData: any,
    tokenData?: any
  ): Promise<any> {
    return await this.userRepo.getAllComplaintsV1(userData, tokenData);
  }
}
