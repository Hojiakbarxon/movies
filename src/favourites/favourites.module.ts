import { Module } from '@nestjs/common';
import { FavouritesService } from './favourites.service';
import { FavouritesController } from './favourites.controller';
import { Conflict } from '../utils/conflict';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Favourites } from './entities/favourite.entity';
import { Movie } from '../movies/entities/movie.entity';
import { Token } from '../utils/Token';

@Module({
  imports: [TypeOrmModule.forFeature([
    User,
    Favourites,
    Movie
  ])],
  controllers: [FavouritesController],
  providers: [FavouritesService, Conflict, Token],
})
export class FavouritesModule { }
