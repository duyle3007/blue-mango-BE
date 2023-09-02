import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PAGINATION_LIMIT, PAGINATION_SKIP } from 'src/constant/pagination';
import { InvitationDocument, InvitationEntity } from './invitation.schema';

@Injectable()
export class InvitationService {
  constructor(
    @InjectModel(InvitationEntity.name)
    private invitaionModel: Model<InvitationDocument>,
  ) {}

  async createInvitation(from: string, to: string) {
    const exitedInvitation = await this.invitaionModel.findOne({
      to,
      from,
    });

    if (exitedInvitation) return exitedInvitation;

    const createdInvitation = new this.invitaionModel({
      from,
      to,
    });

    const invitation = await createdInvitation.save();

    return invitation;
  }

  async removeInvitation(id: string) {
    return this.invitaionModel.deleteOne({ _id: id });
  }

  async findInvitationById(id: string) {
    return this.invitaionModel.findOne({
      _id: id,
    });
  }

  async countClientInvitation(email: string) {
    return this.invitaionModel.countDocuments({ to: email });
  }

  async countTherapistInvitation(email: string) {
    return this.invitaionModel.countDocuments({ from: email });
  }

  /**
   * Get list invitations of client
   * @param email Email of client
   * @param options Options of query
   * @returns List of invitations
   */
  async findClientInvitations(
    email: string,
    options?: { skip?: number; limit?: number },
  ) {
    const res = await this.invitaionModel
      .find({
        to: email,
      })
      .skip(options?.skip ?? PAGINATION_SKIP)
      .limit(options.limit ?? PAGINATION_LIMIT)
      .exec();

    return res;
  }

  /**
   * Get list invitaiton of therapist
   * @param email Email of therapist
   * @param options Options for query
   * @returns List of invitations
   */
  async findTherapistInvitations(
    email: string,
    options?: { skip?: number; limit?: number },
  ) {
    const res = await this.invitaionModel
      .find({
        from: email,
      })
      .skip(options?.skip ?? PAGINATION_SKIP)
      .limit(options.limit ?? PAGINATION_LIMIT)
      .exec();

    return res;
  }
}
