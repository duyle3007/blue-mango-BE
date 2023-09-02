import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from './modules/logger';
import {
  morganRequestLogger,
  morganResponseLogger,
} from './modules/logger/morgan';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = Logger.getInstance();
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  logger.config = {
    showData: configService.get('LOGGER_SHOW_DATA'),
    depth: configService.get('LOGGER_DEPTH'),
    multiline: configService.get('LOGGER_MULTILINE'),
    colorize: configService.get('LOGGER_COLORIZE'),
    showHidden: configService.get('LOGGER_SHOW_HIDDEN'),
    level: configService.get('LOGGER_LEVEL'),
  };

  app.use(cookieParser());
  app.use(morganRequestLogger(logger), morganResponseLogger(logger));
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const documentOptions = new DocumentBuilder()
    .setTitle('Blue mango')
    .setDescription('Blue mango app')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, documentOptions);

  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
