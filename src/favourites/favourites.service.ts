import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFavouriteDto } from './dto/create-favourite.dto';
import { UpdateFavouriteDto } from './dto/update-favourite.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Favourites } from './entities/favourite.entity';
import { Repository } from 'typeorm';
import { Movie } from '../movies/entities/movie.entity';
import { Conflict } from '../utils/conflict';
import { Isuccess } from '../utils/success-response-interface';
import { User } from '../users/entities/user.entity';

@Injectable()
export class FavouritesService {
  constructor(
    @InjectRepository(Favourites) private readonly favouriteRepo: Repository<Favourites>,
    @InjectRepository(Movie) private readonly movieRepo: Repository<Movie>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly conflicts: Conflict) { }

  async create(createFavouriteDto: CreateFavouriteDto, userId: string): Promise<Isuccess> {
    let { movie_id } = createFavouriteDto;

    let movie = await this.conflicts.mustExist({ id: movie_id }, this.movieRepo, 'Movie', 'ID') as Movie;

    let user = await this.conflicts.mustExist({ id: userId }, this.userRepo, "User", 'ID') as User;

    let favourite = await this.favouriteRepo.create({
      movie,
      user
    });

    favourite = await this.favouriteRepo.save(favourite);

    return {
      statusCode: 201,
      message: "Movie added to favourites",
      data: {
        id: favourite.id,
        movie_id,
        movie_title: movie.title,
        created_at: favourite.created_at
      }
    }
  }

  async findAll(userId: string): Promise<Isuccess> {
    let user = await this.conflicts.mustExist({ id: userId }, this.userRepo, 'User', "ID") as User;
    let favourites = await this.favouriteRepo.find({
      where: {
        user: {
          id: userId
        }
      },
      relations: {
        movie: true
      }
    });




    let movies: Partial<Movie>[] = [];

    favourites.forEach((fav) => {
      let movie: Partial<Movie> = {
        id: fav.movie.id,
        title: fav.movie.title,
        slug: fav.movie.slug,
        poster_url: fav.movie.poster_url,
        release_year: fav.movie.release_year,
        rating: fav.movie.rating,
        subscription_type: fav.movie.subscription_type
      };

      movies.push(movie)
    })

    let total = favourites.length;

    return {
      statusCode: 200,
      message: "success",
      data: {
        movies,
        total
      }
    }

  }

  async remove(userId: string, movieId: string): Promise<Isuccess> {

    let favourite = await this.favouriteRepo.findOne({
      where: {
        user: { id: userId },
        movie: { id: movieId }
      }
    })

    if (!favourite) throw new BadRequestException("This movie does not exist in your favourites")


    await this.favouriteRepo.delete({ user: { id: userId }, movie: { id: movieId } });
    return {
      statusCode: 200,
      message: "Movie has been deleted from favourites",
      data: {}
    }
  }
}
