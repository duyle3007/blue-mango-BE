import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import { Model } from 'mongoose';
import { PAGINATION_LIMIT, PAGINATION_SKIP } from 'src/constant/pagination';
import RequestStatus from './domain/request-status.enum';
import { CreateRequestDTO } from './dto/create-request.dto';
import { RequestDocument, RequestEntity } from './request.schema';

@Injectable()
export class RequestService {
  constructor(
    @InjectModel(RequestEntity.name)
    private requestModel: Model<RequestDocument>,
  ) {}

  async createRequest(payload: CreateRequestDTO) {
    const request = new this.requestModel(payload);

    return request.save();
  }

  async updateRequestStatus(requestId: string, status: RequestStatus) {
    return this.requestModel.findByIdAndUpdate(
      { _id: requestId },
      { status },
      { new: true },
    );
  }

  async getRequestByClientId(
    clientId: string,
    options?: { status?: string; limit?: number; skip?: number },
  ) {
    const [requests, total] = await Promise.all([
      this.requestModel
        .find({
          clientId,
          ...(options.status ? { status: options.status } : {}),
        })
        .skip(options?.skip ?? PAGINATION_SKIP)
        .limit(options.limit ?? PAGINATION_LIMIT)
        .exec(),
      this.requestModel.countDocuments({
        clientId,
        ...(options.status ? { status: options.status } : {}),
      }),
    ]);

    return {
      requests,
      total,
    };
  }

  async getRequestByTherapistId(
    therapistId: string,
    options?: { status?: string; limit?: number; skip?: number },
  ) {
    const [requests, total] = await Promise.all([
      this.requestModel
        .find({
          therapistId,
          ...(options.status ? { status: options.status } : {}),
        })
        .skip(options?.skip ?? PAGINATION_SKIP)
        .limit(options.limit ?? PAGINATION_LIMIT)
        .exec(),
      this.requestModel.countDocuments({
        therapistId,
        ...(options.status ? { status: options.status } : {}),
      }),
    ]);
    return {
      requests,
      total,
    };
  }

  async getRequestById(requestId: string) {
    return this.requestModel.findOne({ _id: requestId });
  }

  async getRequestIsExpried(day = 30) {
    const [requests, total] = await Promise.all([
      this.requestModel.find({
        status: RequestStatus.PENDING,
        createdAt: { $lt: dayjs().subtract(day, 'day') },
      }),
      this.requestModel.countDocuments({
        status: RequestStatus.PENDING,
        createdAt: { $lt: dayjs().subtract(day, 'day') },
      }),
    ]);

    return {
      requests,
      total,
    };
  }
}
