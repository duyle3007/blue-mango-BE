import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { CreateUserDTO } from './dto/create-user.dto';
import { UserEnity, UserDocument } from './user.schema';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';
import User from './domain/user';
import UserRole from './domain/user-role.enum';
import {
  PAGINATION_LIMIT,
  PAGINATION_ORDER_BY,
  PAGINATION_SKIP,
} from '../../constant/pagination';
import clientInfoPipeline from './piplines/client-infos.pipeline';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserEnity.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {}

  /**
   * This function to encrypte the user data by AES algorithm
   * @param userData The user data
   * @returns CreateUserDTO
   */
  private encryptUserData(userData: User): User {
    // List the property need to be encrypted
    const encryptedProperties = new Set([
      'firstName',
      'lastName',
      'gender',
      'address1',
      'address2',
      'country',
      'state',
      'zipCode',
      'phoneNumber',
      'picture',
      'email',
    ]);

    const encryptUserData: User = {
      ...userData,
    };

    encryptedProperties.forEach((prop) => {
      if (userData[prop]) {
        encryptUserData[prop] = CryptoJS.AES.encrypt(
          userData[prop],
          this.configService.get<string>('SECRET_PASSPHRASE'),
        ).toString();
      }
    });

    return encryptUserData;
  }

  /**
   * This function to dencrypt the user data by AES algorithm
   * @param userData The user data
   * @returns userData with the properties that is decrypted
   */
  private decryptUserData(userData: Partial<UserEnity>): Partial<UserDocument> {
    // List the encrypted properties
    const encryptedProperties = new Set([
      'firstName',
      'lastName',
      'gender',
      'address1',
      'address2',
      'country',
      'state',
      'zipCode',
      'phoneNumber',
      'picture',
      'email',
    ]);

    encryptedProperties.forEach((prop) => {
      if (userData[prop]) {
        userData[prop] = CryptoJS.AES.decrypt(
          userData[prop],
          this.configService.get<string>('SECRET_PASSPHRASE'),
        ).toString(CryptoJS.enc.Utf8);
      }
    });

    return userData;
  }

  /**
   * This function to create new user if the user is not exited in the database.
   * Before save user data in database every information is encrypted by `encryptUserData` function
   * @async
   * @param createUserDto
   * @returns user information
   */
  async createIfNotExist(createUserDto: CreateUserDTO): Promise<UserEnity> {
    const encryptedUserData = this.encryptUserData(createUserDto);
    const user = await this.userModel.findOne({
      hashedEmail: CryptoJS.MD5(createUserDto.email).toString(),
    });

    if (user) {
      return user;
    }

    const createdUser = new this.userModel({
      ...encryptedUserData,
      hashedEmail: CryptoJS.MD5(createUserDto.email).toString(),
    });

    return createdUser.save();
  }

  /**
   * This function to find user by the email of user
   * @async
   * @param email The user's email
   * @returns User
   */
  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({
      hashedEmail: CryptoJS.MD5(email).toString(),
    });

    if (!user) {
      return null;
    }

    const userEntity = this.decryptUserData(user);

    return {
      id: userEntity._id.toString(),
      firstName: userEntity.firstName,
      lastName: userEntity.lastName,
      nickname: userEntity.nickname,
      email: userEntity.email,
      gender: userEntity.gender,
      role: userEntity.role,
      therapist: userEntity.therapist?.toString(),
    };
  }

  /**
   * This function to find user by the id of user
   * @async
   * @param id The user's id
   * @returns User
   */
  async findById(id: string): Promise<User> {
    const user = await this.userModel.findOne({
      _id: id,
    });

    if (!user) {
      return null;
    }

    const userEntity = this.decryptUserData(user);

    return {
      id: userEntity._id.toString(),
      firstName: userEntity.firstName,
      lastName: userEntity.lastName,
      nickname: userEntity.nickname,
      email: userEntity.email,
      gender: userEntity.gender,
      role: userEntity.role,
      course: userEntity.course,
      therapist: userEntity.therapist?.toString(),
    };
  }

  /**
   * This function to update user by the id
   * @async
   * @param id The user's id
   * @returns User
   */

  async update(id: string, payload: Partial<User>): Promise<User> {
    const user = await this.userModel.findOneAndUpdate(
      {
        _id: id,
      },
      payload,
      { new: true },
    );

    if (!user) {
      return null;
    }

    const userEntity = this.decryptUserData(user);

    return {
      id: userEntity._id,
      firstName: userEntity.firstName,
      lastName: userEntity.lastName,
      nickname: userEntity.nickname,
      email: userEntity.email,
      gender: userEntity.gender,
      role: userEntity.role,
    };
  }

  /**
   * This function to find user
   * @async
   * @param params includes limit, skip and the user info for filtering
   * @returns List of user
   */
  async find(
    params?: {
      limit?: number;
      skip?: number;
      sort?: Record<string, PAGINATION_ORDER_BY>;
    } & FilterQuery<UserDocument>,
  ): Promise<{ users: User[]; total: number }> {
    const {
      limit = PAGINATION_LIMIT,
      skip = PAGINATION_SKIP,
      sort = {},
      ...filters
    } = params || {};
    const users = await this.userModel
      .find(filters)
      .skip(skip)
      .sort(sort)
      .limit(limit);
    const total = await this.userModel.countDocuments(filters);

    const userEntities = users
      .map((user) => this.decryptUserData(user))
      .map((userEntity) => ({
        id: userEntity._id.toString(),
        firstName: userEntity.firstName,
        lastName: userEntity.lastName,
        nickname: userEntity.nickname,
        email: userEntity.email,
        gender: userEntity.gender,
        role: userEntity.role,
        therapist: userEntity.therapist?.toString(),
      }));

    return {
      users: userEntities,
      total,
    };
  }

  /**
   * This function to create client in database
   * @param email Email of client
   * @param therapistId id of therapist
   * @returns Client's information
   */
  async createClient(clientInfo: CreateUserDTO, therapistId: string) {
    const user = await this.createIfNotExist({
      email: clientInfo.email,
      role: UserRole.CLIENT,
      therapist: therapistId,
      nickname: clientInfo.nickname,
    });

    return user;
  }

  /**
   * Find therapist by email
   * @param email Email of therapist
   * @returns Therapist's information
   */

  async findTherapistByEmail(email: string): Promise<User> {
    const therapist = await this.findByEmail(email);

    if (!therapist || therapist.role !== UserRole.THERAPIST) {
      return null;
    }

    return therapist;
  }

  /**
   * Find client by email
   * @param email Email of client
   * @returns Client's information
   */

  async findClientByEmail(email: string): Promise<User> {
    const client = await this.findByEmail(email);

    if (!client || client.role !== UserRole.CLIENT) {
      return null;
    }

    return client;
  }

  /**
   * Find client by therapist Id
   * @param therapistId Id of therapsit
   * @param param The info to filter the client. Includes
   * @returns List of client
   */

  async findClientByTherapistId(
    therapistId: string,
    param?: {
      limit?: number;
      skip?: number;
      search?: string;
      filter?: string;
      sort?: string;
      order?: PAGINATION_ORDER_BY;
    },
  ): Promise<{ users: User[]; total: number }> {
    const aggregation = this.userModel.aggregate(
      clientInfoPipeline({
        therapistId,
        search: param?.search,
        filter: param?.filter,
        limit: param?.limit,
        skip: param?.skip,
      }),
    );

    const result = await aggregation.exec();

    return result[0] ?? { total: 0, users: [] };
  }

  /**
   * Find client info
   * @param therapistId Id of therapsit
   * @param clientId Id of client
   * @returns Client info
   */
  async getClientInfo(therapistId: string, clientId: string) {
    const user = await this.userModel.findOne({
      _id: clientId,
      therapist: therapistId,
    });

    if (user) {
      const userEntity = this.decryptUserData(user);
      return {
        id: userEntity._id,
        firstName: userEntity.firstName,
        lastName: userEntity.lastName,
        nickname: userEntity.nickname,
        email: userEntity.email,
        gender: userEntity.gender,
        role: userEntity.role,
        course: userEntity.toObject().course,
      };
    }

    return null;
  }

  /**
   * Update client's course info
   * @param clientId Id of client
   * @param courseData course information
   * @returns Client info
   */

  async udpateCourse(
    clientId: string,
    courseData: {
      totalTime?: number;
      startDate?: Date;
      endDate?: Date;
      maxTimePerDay?: number;
      maxTimePerSession?: number;
      shouldReset?: boolean;
    },
  ) {
    const updateData: Record<string, number | Date | string | boolean> = {};

    if (courseData) {
      for (const key in courseData) {
        updateData[`course.${key}`] = courseData[key];
      }
    }

    const user = await this.userModel.findOneAndUpdate(
      {
        _id: clientId,
      },
      updateData,
      {
        new: true,
      },
    );

    return user;
  }

  /**
   * Update client's course info
   * @param clientId Id of client
   * @param updateInfo Update data of profile
   * @returns Client info
   */

  async updateProfile(
    clientId: string,
    updateInfo: { name?: string },
  ): Promise<User> {
    const user = await this.userModel.findOneAndUpdate(
      {
        _id: clientId,
      },
      {
        nickname: updateInfo.name,
      },
      { new: true },
    );

    const userEntity = this.decryptUserData(user);

    return {
      id: userEntity._id,
      firstName: userEntity.firstName,
      lastName: userEntity.lastName,
      nickname: userEntity.nickname,
      email: userEntity.email,
      gender: userEntity.gender,
      role: userEntity.role,
    };
  }
}
