import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { QuestionsService } from '../questions/questions.service';
import questionTypes from './data/question-type.data';
import questionTopics from './data/question-topic.data';
import questionData from './data/question.data';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  constructor(private questionService: QuestionsService) {}

  async onApplicationBootstrap() {
    await this.questionService.seedQuestionTypes(questionTypes);
    await this.questionService.seedQuestionTopics(questionTopics);
    await this.questionService.seedQuestionData(questionData);
  }
}
