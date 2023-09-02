import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FindQuestionDTO } from './dto/find-question.dto';
import { SeedQuestionDataDTO } from './dto/seed-question-data.dto';
import { SeedQuestionTopicDTO } from './dto/seed-question-topic.dto';
import { SeedQuestionTypeDTO } from './dto/seed-question-type.dto';
import {
  QuestionTypeDocument,
  QuestionTypeEntity,
} from './question-types.schema';
import {
  QuestionTopicDocument,
  QuestionTopicEntity,
} from './questions-topics.schema';
import { QuestionDocument, QuestionEntity } from './questions.schema';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(QuestionEntity.name)
    private questionModel: Model<QuestionDocument>,
    @InjectModel(QuestionTopicEntity.name)
    private questionTopicModel: Model<QuestionTopicDocument>,
    @InjectModel(QuestionTypeEntity.name)
    private questionTypeModel: Model<QuestionTypeDocument>,
  ) {}

  /**
   * This function to init the data form the question type
   * @author Peter Nguyen
   * @param {Array<SeedQuestionTypeDTO>} payload Init data
   * @returns {Array<QuestionTypeEntity>}
   */
  async seedQuestionTypes(
    payload: Array<SeedQuestionTypeDTO>,
  ): Promise<Array<QuestionTypeEntity>> {
    const res = await Promise.all(
      payload.map((item) => {
        return this.questionTypeModel.findOneAndUpdate(
          {
            key: item.key,
          },
          item,
          {
            new: true,
            upsert: true,
          },
        );
      }),
    );

    return res;
  }

  /**
   * This function to init data for the question topic
   * @param {Array<SeedQuestionTopicDTO>} payload Init data
   * @returns {Array<QuestionTopicEntity>}
   */
  async seedQuestionTopics(
    payload: Array<SeedQuestionTopicDTO>,
  ): Promise<Array<QuestionTopicEntity>> {
    const res = await Promise.all(
      payload.map((item) => {
        return this.questionTopicModel.findOneAndUpdate(
          { key: item.key },
          item,
          {
            upsert: true,
            new: true,
          },
        );
      }),
    );

    return res;
  }

  /**
   * This function to init question data
   * @param {Array<SeedQuestionDataDTO>} payload Init data
   * @returns {Array<QuestionEntity>}
   */
  async seedQuestionData(
    payload: Array<SeedQuestionDataDTO>,
  ): Promise<Array<QuestionEntity>> {
    const res = await Promise.all(
      payload.map((item) => {
        return this.questionModel.findOneAndUpdate(
          {
            topic: item.topic,
            type: item.type,
          },
          item,
          {
            upsert: true,
            new: true,
          },
        );
      }),
    );

    return res;
  }

  /**
   * Find the question by type and topic
   * @param payload Include the type and topic information
   * @returns Question info
   */
  async findQuestion(payload: FindQuestionDTO): Promise<QuestionEntity> {
    return this.questionModel.findOne({
      type: payload.type,
      topic: payload.topic,
    });
  }
}
