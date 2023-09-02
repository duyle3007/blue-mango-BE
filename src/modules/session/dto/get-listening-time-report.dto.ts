import { IsDate, IsString } from 'class-validator';

export class GetListeningTimeReportDTO {
  @IsString()
  clientId: string;

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;
}
