import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //הפעל CORS
  app.enableCors({
    origin: "http://localhost:5173", // אפשר גישה מכל מקור (ניתן להגביל לפי צורך)
    credentials: true, // אפשר שליחת עוגיות ובקרות גישה
    //methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
   // allowedHeaders: "Content-Type, Accept, X-Requested-With, x-api-key, Authorization",
  });

  // הגדרת ValidationPipe גלובלי
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // מסיר שדות שלא מוגדרים ב-DTO
      transform: true, // הופך אוטומטית טיפוסים (למשל string ל-number)
      forbidNonWhitelisted: true, // זורק שגיאה אם יש שדות לא מוגדרים
    }),
  );

  // הגדרת Swagger
  const config = new DocumentBuilder()
    .setTitle("Tasks API")
    .setDescription("Tasks Management API for Bootcamp")
    .setVersion("1.0")
    .addApiKey({ type: "apiKey", name: "x-api-key", in: "header" }, "api-key")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}
bootstrap();

//asasa
