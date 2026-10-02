import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Conflict } from '../utils/conflict';
import { MovieCategory } from '../movies/entities/movie-category.entity';
import { Token } from '../utils/Token';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      MovieCategory,
      User
    ])
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService, Conflict, Token],
})
export class CategoriesModule { }
