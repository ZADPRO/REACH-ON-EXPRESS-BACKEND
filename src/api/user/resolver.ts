import { UserRepo } from "./user";

export class UserReporesolver {
  public userRepo: any;
  constructor() {
    this.userRepo = new UserRepo();
  }

  public async userLoginV1(userData: any, tokenData?: any): Promise<any> {
    return await this.userRepo.userLoginV1(userData, tokenData);
  }
}
