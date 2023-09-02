import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Aggregate, FilterQuery, Model } from 'mongoose';
import { CountAdverseReactionDTO } from './dto/count-adverse-reaction.dto';
import { CreateSessionDTO } from './dto/create-session.dto';
import { SessionEntity } from './session.schema';
import { GetHealthInfoDTO } from './dto/get-health-info.dto';
import { flow } from 'lodash';
import dayjs from 'dayjs';
import { GetListeningTimeReportDTO } from './dto/get-listening-time-report.dto';
import { GetCommnetReportDTO } from './dto/get-comment-report.dto';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(SessionEntity.name) private sessionModel: Model<SessionEntity>,
  ) {}

  async createSession(payload: CreateSessionDTO) {
    const session = await this.sessionModel.create({
      author: payload.author,
      questions: payload.questions,
      comments: payload.comments,
      startTime: payload.startTime,
      duration: payload.duration,
      interruptions: payload.interruptions,
      pause: payload.pause,
    });

    return session.save();
  }

  private filterSession(filter: {
    authorId: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    return (aggregate: Aggregate<any[]>) => {
      const conditions: FilterQuery<any[]> = [
        {
          author: new mongoose.Types.ObjectId(filter.authorId),
        },
      ];

      if (filter.startDate && filter.endDate) {
        conditions.push({
          startTime: {
            $gte: filter.startDate,
            $lte: filter.endDate,
          },
        });
      }
      aggregate.append({
        $match: {
          $and: conditions,
        },
      });

      return aggregate;
    };
  }

  private unwindQuestions() {
    return (aggregate: Aggregate<any[]>) => {
      aggregate.append({
        $unwind: {
          path: '$questions',
        },
      });

      return aggregate;
    };
  }

  private filterQuestions(filter: {
    type?: string;
    tags?: string[];
    topics?: string[];
    answer?: string;
  }) {
    const { topics = [], tags = [], type = '', answer = '' } = filter;
    return (aggregate: Aggregate<any[]>) => {
      aggregate.append({
        $lookup: {
          from: 'questionentities',
          localField: 'questions.question',
          foreignField: '_id',
          as: 'questions.question',
        },
      });
      if (topics.length > 0) {
        aggregate.append({
          $match: {
            $or: topics.map((topic) => ({
              'questions.question.topic': topic,
            })),
          },
        });
      }

      if (tags.length > 0) {
        aggregate.append({
          $match: {
            'questions.question.tags': {
              $all: tags,
            },
          },
        });
      }

      if (type) {
        aggregate.append({
          $match: {
            'questions.question.type': {
              $eq: type,
            },
          },
        });
      }

      if (answer) {
        aggregate.append({
          $match: {
            'questions.answer': {
              $eq: answer,
            },
          },
        });
      }

      return aggregate;
    };
  }

  private countQuestionByYear() {
    return (aggregate: Aggregate<any[]>) => {
      aggregate.append({
        $group: {
          _id: {
            year: {
              $year: '$startTime',
            },
            date: {
              $dateToString: {
                format: '%d/%m/%Y',
                date: '$startTime',
              },
            },
          },
          total: {
            $count: {},
          },
        },
      });
      return aggregate;
    };
  }

  async countAdverseReaction(
    payload: CountAdverseReactionDTO,
  ): Promise<Array<{ _id: string; items: number }>> {
    const { clientId, startDate, endDate, topics = [] } = payload;

    const aggregate = this.sessionModel.aggregate([]);
    const aggregateQuestion = flow([
      this.filterSession({
        authorId: clientId,
        startDate: startDate,
        endDate: endDate,
      }),
      this.unwindQuestions(),
      this.filterQuestions({
        answer: 'yes',
        type: 'yes_no',
        tags: ['negative_effect'],
        topics,
      }),
      this.countQuestionByYear(),
    ]);

    aggregateQuestion(aggregate);

    aggregate.append({
      $group: {
        _id: '$_id.year',
        items: {
          $push: {
            date: '$_id.date',
            count: '$total',
          },
        },
      },
    });

    // Show latest data first
    aggregate.append({ $sort: { _id: -1 } });

    const result = await aggregate.exec();

    return result;
  }

  async getHealthInfo(payload: GetHealthInfoDTO) {
    const { clientId, startDate, endDate } = payload;

    const aggregate = this.sessionModel.aggregate([]);
    const aggregateQuestion = flow([
      this.filterSession({
        authorId: clientId,
        startDate: startDate,
        endDate: endDate,
      }),
      this.unwindQuestions(),
      this.filterQuestions({
        type: 'rating',
      }),
    ]);
    aggregateQuestion(aggregate);

    aggregate.append({
      $project: {
        answerInt: {
          $convert: {
            input: '$questions.answer',
            to: 'int',
            onError: 0,
            onNull: 0,
          },
        },
        topic: '$questions.question.topic',
        startTime: '$startTime',
      },
    });

    aggregate.append({
      $group: {
        _id: {
          topic: '$topic',
          year: {
            $year: '$startTime',
          },
          date: {
            $dateToString: {
              format: '%d/%m/%Y',
              date: '$startTime',
            },
          },
        },
        answerInt: {
          $avg: '$answerInt',
        },
      },
    });

    aggregate.append({
      $group: {
        _id: {
          topic: '$_id.topic',
          year: '$_id.year',
        },
        items: {
          $push: {
            date: '$_id.date',
            value: '$answerInt',
          },
        },
      },
    });

    aggregate.append({
      $group: {
        _id: '$_id.year',
        items: {
          $push: {
            topic: '$_id.topic',
            items: '$items',
          },
        },
      },
    });

    aggregate.append({
      $project: {
        year: '$_id',
        items: {
          $sortArray: {
            input: '$items',
            sortBy: { topic: 1 },
          },
        },
      },
    });

    // Show latest data first
    aggregate.append({ $sort: { year: -1 } });

    const result = await aggregate.exec();

    return result;
  }

  async getReportByDay(clientId: string, date: Date) {
    return this.sessionModel
      .find({
        author: clientId,
        startTime: {
          $gte: dayjs(date).startOf('day'),
          $lte: dayjs(date).endOf('day'),
        },
      })
      .populate({
        path: 'questions.question',
      })
      .populate('comments')
      .exec();
  }

  async getListeningReport(payload: GetListeningTimeReportDTO) {
    const { clientId, startDate, endDate } = payload;
    const aggregate = this.sessionModel.aggregate([]);

    const aggregateQuestion = flow([
      this.filterSession({
        authorId: clientId,
        startDate: startDate,
        endDate: endDate,
      }),
    ]);

    aggregateQuestion(aggregate);

    aggregate.append({
      $group: {
        _id: {
          date: {
            $dateToString: {
              format: '%d/%m/%Y',
              date: '$startTime',
            },
          },
          year: {
            $year: '$startTime',
          },
        },
        duration: {
          $sum: '$duration',
        },
        pause: {
          $sum: '$pause',
        },
        interruptions: {
          $sum: '$interruptions',
        },
        sessions: {
          $count: {},
        },
      },
    });

    aggregate.append({
      $group: {
        _id: '$_id.year',
        items: {
          $push: {
            date: '$_id.date',
            duration: '$duration',
            pause: '$pause',
            interruptions: '$interruptions',
            sessions: '$sessions',
          },
        },
      },
    });

    // Show latest data first
    aggregate.append({ $sort: { year: -1 } });

    const result = await aggregate.exec();

    return result;
  }

  async getCommentReport(payload: GetCommnetReportDTO) {
    const { clientId, startDate, endDate } = payload;
    const aggregate = this.sessionModel.aggregate([]);

    const aggregateQuestion = flow([
      this.filterSession({
        authorId: clientId,
        startDate: startDate,
        endDate: endDate,
      }),
    ]);

    aggregateQuestion(aggregate);

    aggregate.append({
      $group: {
        _id: {
          date: {
            $dateToString: {
              format: '%d/%m/%Y',
              date: '$startTime',
            },
          },
          year: {
            $year: '$startTime',
          },
        },
        comments: {
          $sum: {
            $size: '$comments',
          },
        },
      },
    });

    aggregate.append({
      $group: {
        _id: '$_id.year',
        items: {
          $push: {
            date: '$_id.date',
            duration: '$duration',
            pause: '$pause',
            interruptions: '$interruptions',
            comments: '$comments',
          },
        },
      },
    });

    // Show latest data first
    aggregate.append({ $sort: { year: -1 } });

    const result = await aggregate.exec();

    return result;
  }
}
