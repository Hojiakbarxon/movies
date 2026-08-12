import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { MovieCategory } from './entities/movie-category.entity';
import { Conflict } from '../utils/conflict';
import { MovieFile } from './entities/movie-file.entity';
import { Favourites } from '../favourites/entities/favourite.entity';
import { Reviews } from './entities/reviews.entity';
import { Token } from '../utils/Token';
import { Payment } from '../payments/entities/payment.entity';
import { UserSubscription } from '../subscriptions/entities/user-subscription.entity';
import { AdminMoviesController } from './admin.movies.controller';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      Movie,
      Category,
      User,
      MovieCategory,
      MovieFile,
      Favourites,
      Reviews,
      Payment,
      UserSubscription
    ])
  ],
  controllers: [MoviesController, AdminMoviesController],
  providers: [MoviesService, Conflict, Token],
})
export class MoviesModule {}
