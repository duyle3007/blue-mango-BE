import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import User from 'src/modules/user/domain/user';
import UserRole from 'src/modules/user/domain/user-role.enum';
import { AcceptInvitationDTO } from './dto/accept-invitation.dto';
import { GetInvitationsDTO } from './dto/get-invitations.dto';
import { GetRequestDTO } from './dto/get-request.dto';
import { SubmitSessionDTO } from './dto/submit-session.dto';
import { UploadAudioDTO } from './dto/upload-audio.dto';
import { ClientService } from './client.service';
import { SubmitMobileSessionDTO } from './dto/submit-mobile-session.dto';
import { mapPayloadMobieSessionToSession } from './client.mapper';

@ApiBearerAuth()
@ApiTags('client')
@Controller('client')
@Roles(UserRole.CLIENT)
export class ClientController {
  constructor(private clientService: ClientService) {}

  @Put('/accept-invitation')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Accept an invitation from therapist, only client can use',
  })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden' })
  @ApiOkResponse({
    status: 200,
    description: 'Return nothing',
  })
  async acceptInvitation(@Body() payload: AcceptInvitationDTO) {
    return this.clientService.acceptInvitation(payload.invitationId);
  }

  @Get('/invitations')
  @ApiOperation({
    summary: 'Get invitaion of client',
  })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden' })
  @ApiOkResponse({
    status: 200,
    description: 'Return list invitation',
  })
  async getInvitations(
    @Request() req: Request & { user: User },
    @Param() param: GetInvitationsDTO,
  ) {
    const user = req.user; // User information is attached in the role guard

    return this.clientService.getInvitations(user.email, param);
  }

  @Post('/audio')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Client upload audio',
  })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden' })
  @ApiOkResponse({
    status: 201,
    description: 'Return link of audio',
  })
  async uploadAudio(
    @Request() req: Request & { user: User },
    @Body() body: UploadAudioDTO,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'mp4',
        })
        .addMaxSizeValidator({
          maxSize: 90_000,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    const { id } = await this.clientService.uploadAudio(body.name, file, {
      client: req.user.id,
      therapist: req.user.therapist,
    });

    return {
      id,
    };
  }

  @Get('/requests')
  @ApiOperation({
    summary: 'Get the requests of client',
  })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden' })
  @ApiOkResponse({
    status: 200,
    description: 'Return list request',
  })
  async getRequest(
    @Request() req: Request & { user: User },
    @Query() query: GetRequestDTO,
  ) {
    const user = req.user; // User information is attached in the role guard
    return this.clientService.getRequest(user.id, query);
  }

  @Post('/sessions')
  @ApiOperation({
    summary: 'Submit session',
  })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden' })
  @ApiOkResponse({
    status: 204,
    description: 'Return nothing',
  })
  async submitSession(
    @Request() req: Request & { user: User },
    @Body() payload: SubmitSessionDTO,
  ) {
    const user = req.user;
    await this.clientService.submitSession(user.id, payload);
    return;
  }

  @Post('/mobile/sessions')
  @ApiOperation({
    summary: 'Submit session from mobile',
  })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden' })
  @ApiOkResponse({
    status: 204,
    description: 'Return nothing',
  })
  async submitMobileSession(
    @Request() req: Request & { user: User },
    @Body() payload: SubmitMobileSessionDTO,
  ) {
    const user = req.user;
    await this.clientService.submitSession(
      user.id,
      mapPayloadMobieSessionToSession(payload),
    );
    return;
  }
}
