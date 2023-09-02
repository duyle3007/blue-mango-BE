import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AcceptInvitationDTO {
  @IsString()
  @ApiProperty({
    description: 'Id of the invitation',
  })
  invitationId: string;
}
