import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('JëndCiThiès API')
    .setDescription('Plateforme SaaS de commerce local - Thiès, Sénégal')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT || 3000);

  // Le frontend Next.js occupe le port 3001 : un backend sur ce port provoque
  // systématiquement EADDRINUSE côté frontend. On échoue vite avec un message clair.
  if (port === 3001) {
    console.error(
      '❌ PORT=3001 est réservé au frontend Next.js. Utilisez PORT=3000 dans backend/.env, puis relancez.',
    );
    process.exit(1);
  }

  await app.listen(port);
  console.log(`🚀 Serveur démarré sur le port ${port}`);
}

bootstrap();
