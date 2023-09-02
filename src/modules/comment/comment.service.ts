import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentEntity } from './comment.schema';
import { CreateCommentDTO } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(CommentEntity.name) private commentModel: Model<CommentEntity>,
  ) {}

  async createComments(
    payload: Array<CreateCommentDTO>,
  ): Promise<Array<string>> {
    const res = await this.commentModel.insertMany(payload);

    return res.map((item) => item._id.toString());
  }
}
