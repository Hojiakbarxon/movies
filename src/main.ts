import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from "dotenv";
import { validationConfig } from './startup/validationConfig';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { envConfig } from './utils/env.config';
import cookieParser from "cookie-parser"
import { UsersService } from './users/users.service';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './log/winston.config';

async function main() {
  dotenv.config();
  const port = envConfig.port
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig)
  });


  validationConfig(app);

  // app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  //   prefix: '/uploads/',
  // });

  app.use(cookieParser())

  app.setGlobalPrefix("api");

  app.enableCors({
    origin: ['https://housereel.netlify.app', 'http://localhost:5173'],
    credentials: true,
  });

  const userService = app.get(UsersService);
  let message = await userService.createSuperAdmin();
  console.log(message);

  await app.listen(port, () => console.log(`Server is running on port ${port}`));
}
main();
