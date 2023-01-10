import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
const morgan = require('morgan');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(morgan('common'));
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // transform: true // intenta transformar el input a el tipo de dato que le indicamos en la ruta que esperamos que sea. Excelente!
      forbidNonWhitelisted: false,
      disableErrorMessages:
        process.env.NODE_ENV === 'PRODUCTION' ? true : false,
    }),
  );
  await app.listen(3333);
}
bootstrap();
