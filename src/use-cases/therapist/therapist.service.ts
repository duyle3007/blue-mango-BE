import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { PAGINATION_ORDER_BY } from 'src/constant/pagination';
import { Auth0Service } from 'src/modules/auth0/auth0.service';
import { FileService } from 'src/modules/file/file.service';
import { IdentityService } from 'src/modules/indentity/identity.service';
import { InvitationService } from 'src/modules/invitation/invitation.service';
import { MailService } from 'src/modules/mail/mail.service';
import RequestStatus from 'src/modules/request/domain/request-status.enum';
import { RequestService } from 'src/modules/request/request.service';
import { SessionService } from 'src/modules/session/session.service';
import User from 'src/modules/user/domain/user';
import { UserService } from 'src/modules/user/user.service';
import {
  CreateInvitationDTO,
  InvitationType,
} from './dto/create-invitation.dto';

dayjs.extend(customParseFormat);
@Injectable()
export class TherapistService {
  constructor(
    private auth0Service: Auth0Service,
    private mailService: MailService,
    private userService: UserService,
    private identityService: IdentityService,
    private invitationService: InvitationService,
    private fileService: FileService,
    private requestService: RequestService,
    private sessionService: SessionService,
  ) {}

  /**
   * Invitation flow for new client
   * [x] Create user in the auth0 system
   * [x] Create user in database with client role
   * [x] Create indentity in the database
   * [x] Create the changing password link
   * [x] Send the link to user
   * @param email Email of new paitient
   * @param therapist Information of threapist
   */
  async inviteNewClient(
    invitation: InvitationType,
    therapist: User,
  ): Promise<void> {
    const auth0User = await this.auth0Service.createUser(invitation.email);
    const user = await this.userService.createClient(
      {
        email: auth0User.email,
        nickname: invitation.nickname,
      },
      therapist.id,
    );
    this.identityService.createIfNotExist({
      providerId: auth0User.user_id,
      user: user._id,
    });

    const link = await this.auth0Service.changePassword(auth0User.email);

    this.mailService.sendNewClientInvitation({
      email: auth0User.email,
      changePasswordLink: link,
      therapistEmail: therapist.email,
      therapistName: therapist.firstName,
    });
  }

  /**
   * Invitation flow for existed client
   * [x] Throw error if client is invited by same therapist
   * [x] Create an invitation in database
   * [x] Send email to notice the client
   * @param client Information of client
   * @param therapist Information of therapist
   */
  async inviteExitedClient(client: User, therapist: User): Promise<void> {
    if (client.therapist === therapist.id) {
      throw new ConflictException('This client is invited by this therapist');
    }

    await this.invitationService.createInvitation(
      therapist.email,
      client.email,
    );
    this.mailService.sendExitedClientInvitation({
      email: client.email,
      therapistEmail: therapist.email,
      therapistName: therapist.firstName,
    });
  }

  /**
   * This user invitation flow.
   * Include the steps:
   * [x] Invite multiple clients
   * [x] If client is new, using new client invitaiton flow
   * [x] If user in system, using exited client invitation flow
   * @async
   * @param email Email of client
   * @return {Promise<{ clientId: string }>} Client's id
   */
  async inviteClients(
    payload: CreateInvitationDTO,
    therapist: User,
  ): Promise<void[]> {
    return Promise.all(
      payload.invitations.map(async (invitaion) => {
        const exitedClient = await this.userService.findByEmail(
          invitaion.email,
        );

        if (!exitedClient) {
          return this.inviteNewClient(invitaion, therapist);
        }

        return this.inviteExitedClient(exitedClient, therapist);
      }),
    );
  }

  /**
   * Get the invitations of therapist
   * @param email Email of therapist
   * @param options Option of query
   * @returns List invitation that therapist sent
   */
  async getInvitations(
    email: string,
    options?: { limit?: number; skip?: number },
  ) {
    const [total, invitations] = await Promise.all([
      this.invitationService.countTherapistInvitation(email),
      this.invitationService.findTherapistInvitations(email, options),
    ]);
    return {
      total,
      invitations,
    };
  }

  /**
   * Therapist accept request of client. This progress includes:
   * [x] Remove the audio file
   * [x] Update request's status to ACCEPT
   * @param requestId Id of request
   * @returns Nothing
   */
  async acceptRequest(requestId: string) {
    const request = await this.requestService.getRequestById(requestId);

    if (!request) {
      throw new NotFoundException('The request is not found');
    }

    const [file] = await this.fileService.findFile(request.audioId);

    if (!file) throw new NotFoundException('Audio is not found');

    this.fileService.removeFile(request.audioId);

    return this.requestService.updateRequestStatus(
      requestId,
      RequestStatus.ACCEPT,
    );
  }

  /**
   * Therapist accept request of client. This progress includes:
   * [x] Remove the audio file
   * [x] Update request's status to REJECT
   * @param requestId Id of request
   * @returns Nothing
   */
  async rejectRequest(requestId: string) {
    const request = await this.requestService.getRequestById(requestId);

    if (!request) {
      throw new NotFoundException('The request is not found');
    }

    const [file] = await this.fileService.findFile(request.audioId);

    if (!file) throw new NotFoundException('Audio is not found');

    this.fileService.removeFile(request.audioId);

    return this.requestService.updateRequestStatus(
      requestId,
      RequestStatus.REJECT,
    );
  }

  /**
   * Get the requests that are pending
   * @param therapistId Id string
   * @param param Options to filter
   * @returns List request
   */
  async getRequest(
    therapistId: string,
    param?: { status?: string; limit?: number; skip?: number },
  ) {
    return this.requestService.getRequestByTherapistId(therapistId, param);
  }

  /**
   * Get the clients of therapist
   * @param therapistId Id string
   * @param param Options to filter
   * @returns List client
   */
  async getClients(
    therapistId: string,
    param?: {
      limit?: number;
      skip?: number;
      search?: string;
      filter?: string;
      sort?: string;
      order?: PAGINATION_ORDER_BY;
    },
  ) {
    return this.userService.findClientByTherapistId(therapistId, param);
  }

  /**
   * Get the clients info
   * @param therapistId Therapist Id
   * @param clientId Client Id
   * @returns List client
   */
  async getClientInfo(therapistId: string, userId: string) {
    return this.userService.getClientInfo(therapistId, userId);
  }

  /**
   * Count the adverse reaction of client
   * @param clientId Client Id
   * @param options Include start date, end date, and topics
   * @returns
   */
  async countAdverseReaction(
    clientId: string,
    options: { start?: string; end?: string; topics: string[] },
  ) {
    const dateFormat = 'DD/MM/YYYY';
    const result = await this.sessionService.countAdverseReaction({
      clientId,
      startDate: options.start && dayjs(options.start, dateFormat).toDate(),
      endDate: options.end && dayjs(options.end, dateFormat).toDate(),
      topics: options.topics,
    });

    return result.map((item) => ({ year: item._id, items: item.items }));
  }

  /**
   * Get health infomation of client
   * @param clientId Client Id
   * @param options Include start date, end date, and topics
   * @returns
   */

  async getHealthInfo(
    clientId: string,
    options: { start?: string; end?: string },
  ) {
    const dateFormat = 'DD/MM/YYYY';
    const result = await this.sessionService.getHealthInfo({
      clientId,
      startDate: options.start && dayjs(options.start, dateFormat).toDate(),
      endDate: options.end && dayjs(options.end, dateFormat).toDate(),
    });

    return result.map((item) => ({ year: item._id, items: item.items }));
  }

  /**
   * Get report of client by day
   * @param clientId Client Id
   * @param date Date of report
   * @returns Client's report by day
   */

  async getReportByDay(clientId: string, date: string) {
    const dateFormat = 'DD/MM/YYYY';
    const objectDate = dayjs(date, dateFormat).toDate();

    return this.sessionService.getReportByDay(clientId, objectDate);
  }

  /**
   * Get comment infomation of client
   * @param clientId Client Id
   * @param options Include start date, end date
   * @returns
   */
  async getListeningTimeReport(
    clientId: string,
    options: { start?: string; end?: string },
  ) {
    const dateFormat = 'DD/MM/YYYY';
    const result = await this.sessionService.getListeningReport({
      clientId,
      startDate: options.start && dayjs(options.start, dateFormat).toDate(),
      endDate: options.end && dayjs(options.end, dateFormat).toDate(),
    });

    return result.map((item) => ({ year: item._id, items: item.items }));
  }

  /**
   * Get comment infomation of client
   * @param clientId Client Id
   * @param options Include start date, end date
   * @returns
   */
  async getCommentReport(
    clientId: string,
    options: { start?: string; end?: string },
  ) {
    const dateFormat = 'DD/MM/YYYY';
    const result = await this.sessionService.getCommentReport({
      clientId,
      startDate: options.start && dayjs(options.start, dateFormat).toDate(),
      endDate: options.end && dayjs(options.end, dateFormat).toDate(),
    });

    return result.map((item) => ({ year: item._id, items: item.items }));
  }

  /**
   * Get comment infomation of client
   * @param clientId Client Id
   * @param udpateData Updating data of client
   * @returns
   */
  async updateClientInfo(clientId: string, updateData: { name?: string }) {
    return this.userService.updateProfile(clientId, updateData);
  }
}
