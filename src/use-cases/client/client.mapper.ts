import {
  QuestionTopic,
  QuestionType,
} from 'src/modules/questions/question.enum';
import { SubmitMobileSessionDTO } from './dto/submit-mobile-session.dto';
import { SubmitSessionDTO } from './dto/submit-session.dto';

export const mapPayloadMobieSessionToSession = (
  payload: SubmitMobileSessionDTO,
): SubmitSessionDTO => {
  const {
    questions,
    duration,
    starttime,
    interruptions,
    pausedduration,
    courseaccumulatetime,
    coursestart,
    courseend,
  } = payload;
  const formatedQuestion: SubmitSessionDTO['questions'] = [];
  const formatedComments: SubmitSessionDTO['comments'] = [];
  const getTopic = (value: string) => {
    switch (value) {
      case 'shaking':
        return QuestionTopic.TREMBLING_BODY;
      case 'dizziness':
        return QuestionTopic.DIZZINESS;
      case 'sleep':
        return QuestionTopic.SLEEP;
      case 'quieter':
        return QuestionTopic.MIND_QUIETER;
      case 'energy':
        return QuestionTopic.ENERGY;
      case 'hearing':
        return QuestionTopic.HEARING_SENSITIVE;
      case 'nausea':
        return QuestionTopic.NAUSEA;
      case 'thoughts':
        return QuestionTopic.SEPERATE_THOUNGHT;
      case 'awareness':
        return QuestionTopic.AWARENESS_BODY;
      case 'vision':
        return QuestionTopic.TUNNEL_VISION;
      case 'anxiety':
        return QuestionTopic.ANXIETY;
      default:
        return '';
    }
  };

  const getType = (index: number) =>
    [QuestionType.YES_NO, QuestionType.RATING][index];

  const getAnswer = (type: QuestionType, answer: number): string => {
    switch (type) {
      case QuestionType.YES_NO:
        return Boolean(answer) ? 'yes' : 'no';
      case QuestionType.RATING:
        return String(answer);
      default:
        return String(answer);
    }
  };

  for (const key in questions) {
    const [_typeSession, topic] = key.split('.');
    if (topic !== 'comment') {
      formatedQuestion.push({
        answer: getAnswer(getType(questions[key].atype), questions[key].answer),
        type: getType(questions[key].atype),
        topic: getTopic(topic),
      });
    } else {
      formatedComments.push({
        title: 'No title', // TODO: Will remove when support save title for comment
        content: questions[key].comment,
      });
    }
  }

  return {
    questions: formatedQuestion,
    startTime: starttime,
    duration,
    pause: pausedduration,
    interruptions,
    comments: formatedComments,
    courseAccumulateTime: courseaccumulatetime,
    courseStart: coursestart,
    courseEnd: courseend,
  };
};
