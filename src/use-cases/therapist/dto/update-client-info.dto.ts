import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateClientInfoDTO {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The new nick name of paitient',
  })
  name?: string;
}
