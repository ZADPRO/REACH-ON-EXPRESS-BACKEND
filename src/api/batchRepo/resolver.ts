import { BatchRepository } from "./batchRepo";

export class BatchResolver {
  public batchRepository: any;
  constructor() {
    this.batchRepository = new BatchRepository();
  }
  public async parcelTrackingStatusUpdate(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.batchRepository.parcelTrackingStatusUpdate(
      user_data,
      token_data,
      domain_code
    );
  }
}
