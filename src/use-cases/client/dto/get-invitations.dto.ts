import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class GetInvitationsDTO {
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: 'The limit number of invitation record',
  })
  limit?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: 'The start order of invitation record',
  })
  skip?: number;
}
