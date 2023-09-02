import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetRequestDTO {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Status of request',
  })
  status?: string;

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
