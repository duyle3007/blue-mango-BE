import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateIdentityDTO } from './dto/create-identity.dto';
import { Identity, IdentityDocument } from './identity.schema';

@Injectable()
export class IdentityService {
  constructor(
    @InjectModel(Identity.name) private identityModel: Model<IdentityDocument>,
  ) {}

  /**
   * This function to create the identity if not exist in database
   * @author Peter Nguyen
   * @async
   * @param {CreateIdentityDTO} createIdentityDto The identity information
   * @return {Identity | null}
   */
  async createIfNotExist(
    createIdentityDto: CreateIdentityDTO,
  ): Promise<Identity> {
    const identity = await this.identityModel.findOne({
      providerId: createIdentityDto.providerId,
    });

    if (identity) {
      return identity;
    }

    const createdIdentity = new this.identityModel(createIdentityDto);
    return createdIdentity.save();
  }

  /**
   * This function to find the identity by provider id in database
   * @author Peter Nguyen
   * @async
   * @param {String} providerId The profile id is get from the provider (google, facebook, ...)
   * @return {Identity | null}
   */
  async findByProviderId(providerId: string): Promise<Identity | null> {
    const identity = this.identityModel.findOne({ providerId }).populate({
      path: 'user',
      select: {
        email: 1,
        role: 1,
      },
    });
    return identity;
  }
}
