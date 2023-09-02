import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FileService } from '../file/file.service';
import RequestStatus from '../request/domain/request-status.enum';
import { RequestService } from '../request/request.service';

@Injectable()
export class TasksService {
  constructor(
    private fileService: FileService,
    private requestService: RequestService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async autoRejectRequest() {
    let totalExpiredRequest = 0;
    let handledRequests = 0;
    do {
      const expiredRequest = await this.requestService.getRequestIsExpried();
      totalExpiredRequest = expiredRequest.total;
      handledRequests = expiredRequest.requests.length;

      expiredRequest.requests.forEach((request) => {
        this.fileService.removeFile(request.audioId);
        this.requestService.updateRequestStatus(
          request._id,
          RequestStatus.REJECT,
        );
      });
    } while (totalExpiredRequest > handledRequests);
  }
}
