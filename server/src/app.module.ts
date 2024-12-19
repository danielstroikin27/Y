import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImagesModule } from './images/images.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { DataSourceOptions } from 'typeorm';
import { MinioModule } from './storage/storage.module';
import { ScheduleModule } from '@nestjs/schedule';

dotenv.config(); // Load environment variables from .env

const databaseUrl = process.env.DATABASE_URL;
const parsedUrl = new URL(databaseUrl);

const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: parsedUrl.hostname,
  port: parseInt(parsedUrl.port, 10),
  username: parsedUrl.username,
  password: parsedUrl.password,
  database: parsedUrl.pathname.slice(1), // Remove leading '/'
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true, // Disable in production
};

@Module({
  imports: [ImagesModule, TypeOrmModule.forRoot(typeOrmConfig), MinioModule, ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
