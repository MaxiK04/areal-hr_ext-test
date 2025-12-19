import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Добавь CORS здесь
  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });

  // Убедись, что listen() вызывается только один раз
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

// Эта строка должна быть только одна
bootstrap();