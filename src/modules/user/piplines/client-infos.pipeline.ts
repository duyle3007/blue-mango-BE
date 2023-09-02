import mongoose from 'mongoose';

export default function clientInfoPipeline(params: {
  therapistId: string;
  search?: string;
  filter?: string;
  limit?: number;
  skip?: number;
}) {
  const filterSubCondition = {};

  if (params?.filter) {
    filterSubCondition[params?.filter] = {
      $gt: 0,
    };
  }

  return [
    {
      $match:
        /**
         * therapist: Filter client by the therapist id.
         * Filter by name client
         */
        {
          therapist: new mongoose.Types.ObjectId(params.therapistId),
          nickname: {
            $regex: params?.search ?? '',
            $options: 'i',
          },
        },
    },
    {
      $lookup:
        /**
         * Map sessions info
         */
        {
          from: 'sessionentities',
          localField: '_id',
          foreignField: 'author',
          as: 'sessions',
        },
    },
    {
      $lookup:
        /**
         * Map request info
         */
        {
          from: 'requestentities',
          localField: '_id',
          foreignField: 'client',
          as: 'requests',
        },
    },
    {
      $lookup:
        /**
         * Map comment info
         */
        {
          from: 'commententities',
          localField: '_id',
          foreignField: 'author',
          as: 'comments',
        },
    },
    {
      $project:
        /**
         * Create minTime for filter sessions last 30 days
         * Change field nickname to name
         */
        {
          name: '$nickname',
          course: '$course',
          sessions: '$sessions',
          requests: '$requests',
          comments: '$comments',
          minTime: {
            $dateSubtract: {
              startDate: '$$NOW',
              unit: 'day',
              amount: 30,
            },
          },
        },
    },
    {
      $project:
        /**
         * Filter sesssions by minTime
         * Count request number
         * Count unread comment
         */
        {
          name: '$name',
          course: '$course',
          sessions: {
            $filter: {
              input: '$sessions',
              as: 'item',
              cond: {
                $gte: ['$$item.startTime', '$minTime'],
              },
            },
          },
          requests: {
            $size: '$requests',
          },
          comments: {
            $size: {
              $filter: {
                input: '$comments',
                as: 'item',
                cond: {
                  $eq: ['$$item.unread', true],
                },
              },
            },
          },
        },
    },
    {
      $project:
        /**
         * Flat the questions for filtering
         * Filter question has the answer yes
         * Count listening time
         */
        {
          name: '$name',
          course: '$course',
          questions: {
            $filter: {
              input: {
                $reduce: {
                  input: '$sessions.questions',
                  initialValue: [],
                  in: {
                    $concatArrays: ['$$value', '$$this'],
                  },
                },
              },
              as: 'item',
              cond: {
                $eq: ['$$item.answer', 'yes'],
              },
            },
          },
          listeningTime: {
            $sum: '$sessions.duration',
          },
          comments: '$comments',
          requests: '$requests',
        },
    },
    {
      $lookup:
        /**
         * Map question info
         */
        {
          from: 'questionentities',
          localField: 'questions.question',
          foreignField: '_id',
          as: 'questionRefs',
        },
    },
    {
      $project:
        /**
         * Map question info
         */
        {
          name: '$name',
          course: '$course',
          comments: '$comments',
          requests: '$requests',
          listeningTime: '$listeningTime',
          questions: {
            $map: {
              input: '$questions',
              as: 'item',
              in: {
                answer: '$$item.answer',
                question: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$questionRefs',
                        as: 'ref',
                        cond: {
                          $eq: ['$$ref._id', '$$item.question'],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
            },
          },
        },
    },
    {
      $project:
        /**
         * Filter question has negative tag
         */
        {
          name: '$name',
          course: '$course',
          comments: '$comments',
          requests: '$requests',
          listeningTime: '$listeningTime',
          adverseReactions: {
            $size: {
              $filter: {
                input: '$questions',
                as: 'item',
                cond: {
                  $in: ['negative_effect', '$$item.question.tags'],
                },
              },
            },
          },
        },
    },
    {
      $group:
        /**
         * _id: The id of the group.
         * fieldN: The first field name.
         */
        {
          _id: null,
          total: {
            $sum: 1,
          },
          users: {
            $push: {
              id: '$_id',
              name: '$name',
              course: '$course',
              unreadComments: '$comments',
              requests: '$requests',
              listeningTime: '$listeningTime',
              adverseReactions: '$adverseReactions',
            },
          },
        },
    },
    {
      $project: {
        total: '$total',
        users: {
          $slice: ['$users', params.skip ?? 0, params.limit ?? 5],
        },
      },
    },
  ];
}
