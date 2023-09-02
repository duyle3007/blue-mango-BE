import { Controller, Get, Request } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOkResponse } from '@nestjs/swagger';
import { IdentityService } from 'src/modules/indentity/identity.service';
import { UserService } from 'src/modules/user/user.service';
import GetProfileResponse from './dto/get-profile-response';

@Controller('profile')
export class ProfileController {
  constructor(
    private userService: UserService,
    private identitySerivce: IdentityService,
  ) {}

  @Get()
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOkResponse({
    description: 'Return the information of requester',
    type: GetProfileResponse,
  })
  async getProfile(@Request() req): Promise<GetProfileResponse> {
    const sub = req.auth.payload.sub;
    const identity = await this.identitySerivce.findByProviderId(sub);
    const user = await this.userService.findById(identity.user._id);
    return new GetProfileResponse({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
