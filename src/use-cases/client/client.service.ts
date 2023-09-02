import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentService } from 'src/modules/comment/comment.service';
import { FileService } from 'src/modules/file/file.service';
import { InvitationService } from 'src/modules/invitation/invitation.service';
import { QuestionsService } from 'src/modules/questions/questions.service';
import RequestStatus from 'src/modules/request/domain/request-status.enum';
import { RequestService } from 'src/modules/request/request.service';
import { SessionService } from 'src/modules/session/session.service';
import { UserService } from 'src/modules/user/user.service';
import { SubmitSessionDTO } from './dto/submit-session.dto';

@Injectable()
export class ClientService {
  constructor(
    private invitationService: InvitationService,
    private userService: UserService,
    private fileService: FileService,
    private requestService: RequestService,
    private sessionService: SessionService,
    private commentService: CommentService,
    private questionSerivce: QuestionsService,
  ) {}

  /**
   * Accept invitation includes
   * [x] Find the invitation
   * [x] Throw error if the invitation is not found
   * [x] Find therapist
   * [x] Throw error if therapist is not found
   * [x] Update the client info with therapist id
   * [x] Remove the invitation
   * @param invitationId Id of inviation
   */
  async acceptInvitation(invitationId: string) {
    const invitaiton = await this.invitationService.findInvitationById(
      invitationId,
    );

    if (!invitaiton) {
      throw new NotFoundException('The invitation is not found');
    }

    const therapist = await this.userService.findTherapistByEmail(
      invitaiton.from,
    );

    if (!therapist) {
      throw new NotFoundException('The therapist is not found');
    }

    const client = await this.userService.findClientByEmail(invitaiton.to);

    await this.userService.update(client.id, {
      therapist: therapist.id,
    });

    this.invitationService.removeInvitation(invitationId);
  }

  /**
   * Get the invitation of client
   * @param email Email of client
   * @param options Option of query
   * @returns List invitation of client
   */
  async getInvitations(
    email: string,
    options?: { limit?: number; skip?: number },
  ) {
    const [total, invitations] = await Promise.all([
      this.invitationService.countClientInvitation(email),
      this.invitationService.findClientInvitations(email, options),
    ]);

    return {
      total,
      invitations,
    };
  }
  /**
   * Upload client's audio
   * @param fileName Name of audio
   * @param file File
   * @param audioInfo The information of client and therapist
   * @returns Id of user
   */
  async uploadAudio(
    fileName: string,
    file: Express.Multer.File,
    audioInfo: { client: string; therapist: string },
  ) {
    const { client, therapist } = audioInfo;
    const { id } = await this.fileService.uploadFile(fileName, file.buffer, {
      client,
      therapist,
    });

    this.requestService.createRequest({
      audioId: id,
      client,
      therapist,
      status: RequestStatus.PENDING,
      meta: {
        fileName,
      },
    });

    return { id };
  }

  /**
   * Get the request that client sent
   * @param clientId Id of client
   * @param param The information to filter and paging
   * @returns List request
   */
  async getRequest(
    clientId: string,
    param?: { status?: string; limit?: number; skip?: number },
  ) {
    return this.requestService.getRequestByClientId(clientId, param);
  }

  /**
   * Submit session of client
   * @param userId: Id of client
   * @param payload: The session information
   * @returns
   */
  async submitSession(userId: string, payload: SubmitSessionDTO) {
    const creatingCommentProcess = this.commentService.createComments(
      payload.comments.map((item) => ({
        title: item.title ?? '',
        author: userId,
        content: item.content,
      })),
    );

    const creatingQuestionProcess = Promise.all(
      payload.questions.map(async (item) => {
        const question = await this.questionSerivce.findQuestion({
          type: item.type,
          topic: item.topic,
        });

        return {
          question: question._id,
          answer: item.answer,
        };
      }),
    );

    const updatedUser = this.userService.udpateCourse(userId, {
      endDate: payload.courseEnd,
      startDate: payload.courseStart,
      totalTime: payload.courseAccumulateTime,
    });

    const [comments, questions] = await Promise.all([
      creatingCommentProcess,
      creatingQuestionProcess,
      updatedUser,
    ]);

    return this.sessionService.createSession({
      author: userId,
      comments: comments,
      questions: questions,
      startTime: payload.startTime,
      duration: payload.duration,
      interruptions: payload.interruptions,
      pause: payload.pause,
    });
  }
}
