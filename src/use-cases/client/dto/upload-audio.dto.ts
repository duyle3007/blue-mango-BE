import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UploadAudioDTO {
  @IsString()
  @ApiProperty({
    description: 'Name of audio',
  })
  name: string;
}
