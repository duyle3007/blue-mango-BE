import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import RequestStatus from '../domain/request-status.enum';

export class CreateRequestDTO {
  @IsString()
  audioId: string;

  @IsString()
  client: string;

  @IsString()
  therapist: string;

  @IsEnum(RequestStatus)
  status: RequestStatus;

  @IsObject()
  @IsOptional()
  meta?: {
    fileName: string;
  };
}
