import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';

export class InvitationType {
  @IsString()
  @ApiProperty({
    description: 'Email of client',
  })
  email: string;

  @IsString()
  @ApiProperty({
    description: 'Nickname of client',
  })
  nickname: string;
}
export class CreateInvitationDTO {
  @ValidateNested({ each: true })
  @Type(() => InvitationType)
  invitations: Array<InvitationType>;
}
