import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { IdentityService } from 'src/modules/indentity/identity.service';
import User from 'src/modules/user/domain/user';
import UserRole from 'src/modules/user/domain/user-role.enum';
import { UserService } from 'src/modules/user/user.service';
import { CountClientAdverseReactionsDTO } from './dto/count-client-adverse-reactions.dto';
import { CreateInvitationDTO } from './dto/create-invitation.dto';
import { GetInvitationsDTO } from './dto/get-invitations.dto';
import { GetClientsDTO } from './dto/get-clients.dto';
import { GetRequestDTO } from './dto/get-request.dto';
import { TherapistService } from './therapist.service';
import { GetHealthInfoDTO } from './dto/get-health-info.dto';
import { GetReportByDayDTO } from './dto/get-report-by-day.dto';
import { GetListeningTimeReportDTO } from './dto/get-listening-time-report.dto';
import { GetCommentReportDTO } from './dto/get-comment-report.dto';
import { PatchCourseDTO } from './dto/patch-course.dto';
import { UpdateClientInfoDTO } from './dto/update-client-info.dto';

@ApiBearerAuth()
@ApiTags('therapist')
@Controller('therapist')
@Roles(UserRole.THERAPIST)
export class TherapistController {
  constructor(
    private threapistService: TherapistService,
    private identityService: IdentityService,
    private userService: UserService,
  ) {}

  @Post('/invite')
  @HttpCode(200)
  @ApiOperation({ summary: 'Invite a client, only therapist can use' })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden' })
  @ApiOkResponse({
    status: 200,
    description: 'Return nothing',
  })
  async inviteClient(@Body() payload: CreateInvitationDTO, @Request() req) {
    const providerId = req?.auth?.payload?.sub;
    const identity = await this.identityService.findByProviderId(providerId);
    const therapist = await this.userService.findById(identity.user._id);
    await this.threapistService.inviteClients(payload, therapist);

    return;
  }
  @Get('/invitations')
  @ApiOperation({
    summary: 'Get invitaions that therapist sent',
  })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden' })
  @ApiOkResponse({
    status: 200,
    description: 'Return list invitation',
  })
  async getInvitations(
    @Request() req: Request & { user: User },
    @Query() param: GetInvitationsDTO,
  ) {
    const user = req.user; // User information is attached in the role guard

    return this.threapistService.getInvitations(user.email, param);
  }

  @Put('/requests/accept/:requestId')
  @ApiOperation({
    summary: 'Accept the client request',
  })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden' })
  @ApiOkResponse({
    status: 200,
    description: 'Return request',
  })
  async acceptRequest(@Param('requestId') requestId: string) {
    return await this.threapistService.acceptRequest(requestId);
  }

  @Put('/requests/reject/:requestId')
  @ApiOperation({
    summary: 'Reject the client request',
  })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden' })
  @ApiOkResponse({
    status: 200,
    description: 'Return request',
  })
  async rejectAudio(@Param('requestId') requestId: string) {
    return await this.threapistService.rejectRequest(requestId);
  }

  @Get('/requests')
  @ApiOperation({
    summary: 'Get the requests which are pending',
  })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden' })
  @ApiOkResponse({
    status: 200,
    description: 'Return list request',
  })
  async getRequest(
    @Request() req: Request & { user: User },
    @Query() param: GetRequestDTO,
  ) {
    const user = req.user; // User information is attached in the role guard
    return this.threapistService.getRequest(user.id, param);
  }

  @Get('/clients')
  @ApiOperation({
    summary: 'Get list of client that therapist sent',
  })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden' })
  @ApiOkResponse({
    status: 200,
    description: 'Return list of client',
  })
  async getClient(
    @Request() req: Request & { user: User },
    @Query() param: GetClientsDTO,
  ) {
    const user = req.user; // User information is attached in the role guard

    return this.threapistService.getClients(user.id, param);
  }

  @Get('/clients/:clientId')
  @ApiOperation({
    summary: 'Get client info',
  })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden' })
  @ApiOkResponse({
    status: 200,
    description: 'Return list of client',
  })
  async getClientInfo(
    @Request() req: Request & { user: User },
    @Param('clientId') clientId: string,
  ) {
    const user = req.user; // User information is attached in the role guard

    const client = await this.threapistService.getClientInfo(user.id, clientId);

    if (!client) {
      throw new NotFoundException(`Can not find the client ${clientId}`);
    }

    return client;
  }

  @Patch('/clients/:clientId')
  @ApiOperation({
    summary: 'Update client info',
  })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden' })
  @ApiOkResponse({
    status: 200,
    description: 'Return list of client',
  })
  async updateClientInfo(
    @Request() req: Request & { user: User },
    @Param('clientId') clientId: string,
    @Body() payload: UpdateClientInfoDTO,
  ) {
    const user = req.user; // User information is attached in the role guard
    const client = await this.userService.findById(clientId);

    if (!client) {
      throw new NotFoundException(`Can not find the client ${clientId}`);
    }

    if (client.therapist !== user.id) {
      throw new ForbiddenException(`Can not access data of client ${clientId}`);
    }

    return this.threapistService.updateClientInfo(clientId, payload);
  }

  @Get('/clients/:clientId/adverse-reaction/count')
  @ApiOperation({
    summary: 'Count the adverse reaction',
  })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden' })
  @ApiOkResponse({
    status: 200,
    description: 'Return list number of adverse reactions by date',
  })
  async countClientAdverseReactions(
    @Request() req: Request & { user: User },
    @Param('clientId') clientId: string,
    @Query() query: CountClientAdverseReactionsDTO,
  ) {
    const user = req.user; // User information is attached in the role guard
    const client = await this.userService.findById(clientId);

    if (!client) {
      throw new NotFoundException(`Can not find the client ${clientId}`);
    }

    if (client.therapist !== user.id) {
      throw new ForbiddenException(`Can not access data of client ${clientId}`);
    }

    return await this.threapistService.countAdverseReaction(clientId, {
      start: query.startDate,
      end: query.endDate,
      topics: query.topics,
    });
  }

  @Get('/clients/:clientId/health-info')
  @ApiOperation({
    summary: 'Get the health info',
  })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden' })
  @ApiOkResponse({
    status: 200,
    description: 'Return health info day by day',
  })
  async getHealthInfo(
    @Request() req: Request & { user: User },
    @Param('clientId') clientId: string,
    @Query() query: GetHealthInfoDTO,
  ) {
    const user = req.user; // User information is attached in the role guard
    const client = await this.userService.findById(clientId);

    if (!client) {
      throw new NotFoundException(`Can not find the client ${clientId}`);
    }

    if (client.therapist !== user.id) {
      throw new ForbiddenException(`Can not access data of client ${clientId}`);
    }

    return await this.threapistService.getHealthInfo(clientId, {
      start: query.startDate,
      end: query.endDate,
    });
  }

  @Get('/clients/:clientId/daily-report')
  @ApiOperation({
    summary: 'Get the report of client by day',
  })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden' })
  @ApiOkResponse({
    status: 200,
    description: 'Return report by day',
  })
  async getReportByDay(
    @Request() req: Request & { user: User },
    @Param('clientId') clientId: string,
    @Query() query: GetReportByDayDTO,
  ) {
    const user = req.user; // User information is attached in the role guard
    const client = await this.userService.findById(clientId);

    if (!client) {
      throw new NotFoundException(`Can not find the client ${clientId}`);
    }

    if (client.therapist !== user.id) {
      throw new ForbiddenException(`Can not access data of client ${clientId}`);
    }
    return this.threapistService.getReportByDay(clientId, query.date);
  }

  @Get('/clients/:clientId/listening-time-report')
  @ApiOperation({
    summary: 'Get the listening time report',
  })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden' })
  @ApiOkResponse({
    status: 200,
    description: 'Return listening time report day by day',
  })
  async getListeningTimeReport(
    @Request() req: Request & { user: User },
    @Param('clientId') clientId: string,
    @Query() query: GetListeningTimeReportDTO,
  ) {
    const user = req.user; // User information is attached in the role guard
    const client = await this.userService.findById(clientId);

    if (!client) {
      throw new NotFoundException(`Can not find the client ${clientId}`);
    }

    if (client.therapist !== user.id) {
      throw new ForbiddenException(`Can not access data of client ${clientId}`);
    }

    return this.threapistService.getListeningTimeReport(clientId, {
      start: query.startDate,
      end: query.endDate,
    });
  }

  @Get('/clients/:clientId/comment-report')
  @ApiOperation({
    summary: 'Get the comment report',
  })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden' })
  @ApiOkResponse({
    status: 200,
    description: 'Return comment report day by day',
  })
  async getCommentReport(
    @Request() req: Request & { user: User },
    @Param('clientId') clientId: string,
    @Query() query: GetCommentReportDTO,
  ) {
    const user = req.user; // User information is attached in the role guard
    const client = await this.userService.findById(clientId);

    if (!client) {
      throw new NotFoundException(`Can not find the client ${clientId}`);
    }

    if (client.therapist !== user.id) {
      throw new ForbiddenException(`Can not access data of client ${clientId}`);
    }

    return this.threapistService.getCommentReport(clientId, {
      start: query.startDate,
      end: query.endDate,
    });
  }

  @Get('/clients/:clientId/course')
  @ApiOperation({
    summary: 'Get course config',
  })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden' })
  @ApiOkResponse({
    status: 200,
    description: 'Return course information',
  })
  async getClientCourse(
    @Request() req: Request & { user: User },
    @Param('clientId') clientId: string,
  ) {
    const user = req.user; // User information is attached in the role guard
    const client = await this.userService.findById(clientId);

    if (!client) {
      throw new NotFoundException(`Can not find the client ${clientId}`);
    }

    if (client.therapist !== user.id) {
      throw new ForbiddenException(`Can not access data of client ${clientId}`);
    }

    return client.course;
  }

  @Patch('/clients/:clientId/course')
  @ApiOperation({
    summary: 'Get course config',
  })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden' })
  @ApiOkResponse({
    status: 200,
    description: 'Return course information',
  })
  async patchClientCourse(
    @Request() req: Request & { user: User },
    @Param('clientId') clientId: string,
    @Body() payload: PatchCourseDTO,
  ) {
    const user = req.user; // User information is attached in the role guard
    const client = await this.userService.findById(clientId);

    if (!client) {
      throw new NotFoundException(`Can not find the client ${clientId}`);
    }

    if (client.therapist !== user.id) {
      throw new ForbiddenException(`Can not access data of client ${clientId}`);
    }

    const clientInfo = await this.userService.udpateCourse(clientId, payload);

    return clientInfo.course;
  }
}
