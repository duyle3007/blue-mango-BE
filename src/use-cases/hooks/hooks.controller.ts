import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { HookGuard } from 'src/guards/hook.guard';
import { IdentityService } from 'src/modules/indentity/identity.service';
import UserStatus from 'src/modules/user/domain/user-status.enum';
import { UserService } from 'src/modules/user/user.service';
import RegisterProfileDTO from './dto/register-profile.dto';

@Controller('hooks')
@ApiTags('hooks')
@UseGuards(HookGuard)
export class HooksController {
  constructor(
    private userService: UserService,
    private identitySerivce: IdentityService,
  ) {}
  @Post('register-profile')
  @ApiOkResponse({
    description: 'Register after login by Auth0',
  })
  async registerProfile(@Body('user') userInfo: RegisterProfileDTO) {
    console.log('>>>', userInfo)
    const user = await this.userService.createIfNotExist({
      email: userInfo.email,
      firstName: userInfo.given_name,
      lastName: userInfo.family_name,
      nickname: [userInfo.given_name, userInfo.family_name].join(' '),
      picture: userInfo.picture,
      status: UserStatus.ACTIVE,
    });

    await this.identitySerivce.createIfNotExist({
      providerId: userInfo.sub,
      user: user._id,
    });

    return user;
  }
}
