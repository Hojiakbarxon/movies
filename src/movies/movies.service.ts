import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import slugify from 'slugify';
import { Movie } from './entities/movie.entity';
import { MovieFile } from './entities/movie-file.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { CreateMovieFileDto } from './dto/create-movie-file.dto';
import { Isuccess } from '../utils/success-response-interface';
import { Conflict } from '../utils/conflict';
import { MovieCategory } from './entities/movie-category.entity';
import { User } from '../users/entities/user.entity';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { UpdateMovieFileDto } from './dto/update-movie-file.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { Reviews } from './entities/reviews.entity';
import { R2Service } from '../utils/r2.service';
import { reviewItems } from '../utils/Custom Types/review-item.type';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepo: Repository<Movie>,
    @InjectRepository(MovieFile)
    private readonly movieFileRepo: Repository<MovieFile>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(MovieCategory)
    private readonly movieCategoryRepo: Repository<MovieCategory>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Reviews)
    private readonly reviewRepo: Repository<Reviews>,
    private readonly conflict: Conflict,
    private readonly r2Service: R2Service
  ) { }

  async create(
    dto: CreateMovieDto,
    userId: string,
    poster?: Express.Multer.File,
  ): Promise<Isuccess> {
    const categories = await this.categoryRepo.find({
      where: { id: In(dto.category_ids) },
    });
    if (categories.length !== dto.category_ids.length) {
      throw new BadRequestException('One or more category_ids are invalid');
    }
    const slug = slugify(dto.title, { lower: true, strict: true });
    await this.conflict.mustBeUnique({ slug }, this.movieRepo, 'Movie', 'title');

    const user = await this.conflict.mustExist({ id: userId }, this.userRepo, 'User', 'id') as User

    const movie = this.movieRepo.create({
      title: dto.title,
      slug,
      description: dto.description,
      release_year: dto.release_year,
      duration_minutes: dto.duration_minutes,
      subscription_type: dto.subscription_type,
      poster_url: poster ? await this.r2Service.upload(poster, 'posters') : undefined,
      created_by: user,
      rating: dto.rating
    });

    const savedMovie = await this.movieRepo.save(movie);

    const movieCategories = categories.map((category) =>
      this.movieCategoryRepo.create({ movie: savedMovie, category }),
    );
    await this.movieCategoryRepo.save(movieCategories);

    return {
      statusCode: 201,
      message: 'Movie has been created successfully',
      data: { ...savedMovie, categories },
    };
  }

  async findAll(
    page = 1,
    limit = 20,
    category?: string,
    search?: string,
    subscription_type?: string,
  ): Promise<Isuccess> {
    const qb = this.movieRepo
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.movie_categories', 'movie_category')
      .leftJoinAndSelect('movie_category.category', 'category');

    if (category) {
      qb.andWhere('category.slug = :category', { category });
    }
    if (search) {
      qb.andWhere('movie.title ILIKE :search', { search: `%${search}%` });
    }
    if (subscription_type) {
      qb.andWhere('movie.subscription_type = :subscription_type', { subscription_type });
    }

    qb.skip((page - 1) * limit).take(limit);
    qb.orderBy('movie.created_at', 'DESC');

    const [movies, total] = await qb.getManyAndCount();

    return {
      statusCode: 200,
      message: 'Movies list',
      data: {
        movies,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      },
    };
  }

  async findAllForAdmin(): Promise<Isuccess> {
    let movies = await this.movieRepo.find({
      relations: {
        reviews: true,
        created_by: true
      }
    });

    let arrayOfMovies: object[] = [];

    movies.forEach((movie) => {
      let film = {
        id: movie.id,
        title: movie.title,
        slug: movie.slug,
        release_year: movie.release_year,
        subscription_type: movie.subscription_type,
        view_count: movie.view_count,
        review_count: movie.reviews.length,
        created_at: movie.created_at,
        created_by: movie.created_by?.username
      };

      arrayOfMovies.push(film)
    })
    return {
      statusCode: 200,
      message: "All movies",
      data: {
        movies: arrayOfMovies,
        total: arrayOfMovies.length
      }
    }
  }

  async findBySlug(slug: string, canWatch: boolean): Promise<Isuccess> {
    const movie = await this.movieRepo.findOne({
      where: { slug },
      relations: {
        movie_categories: {
          category: true
        },
        files: true,
        reviews: {
          user: true
        }
      },
    }) as Movie;

    if (!movie) throw new BadRequestException('Movie not found');


    let sumOfRating: number = 0;
    let items: Partial<reviewItems>[] = [];

    movie.reviews.forEach((review) => {
      sumOfRating += review.rating;
      let item: Partial<reviewItems> = {
        id: review.id,
        user: {
          id: review.user.id,
          username: review.user.username,
        },
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at
      };
      items.push(item);
    });

    let total_review: number = movie.reviews.length;
    let average_rating: number = total_review !== 0 ? sumOfRating / total_review : 0;

    const allowed = movie.subscription_type === 'free' || canWatch;

    const data = {
      id: movie?.id,
      title: movie?.title,
      slug: movie?.slug,
      description: movie?.description,
      release_year: movie?.release_year,
      duration_minutes: movie?.duration_minutes,
      poster_url: movie?.poster_url,
      rating: movie.rating,
      subscription_type: movie.subscription_type,
      view_count: movie.view_count,
      categories: movie.movie_categories.map((item) => item.category.name),
      files: allowed ? movie.files : { message: "Activate subscription plan to watch the movie" },
      reviews: {
        average_rating,
        count: total_review,
        items
      }
    };

    // increment view count
    // await this.movieRepo.increment({ id: movie.id }, 'view_count', 1);
    await this.movieRepo.update({ id: movie.id }, {
      view_count: movie.view_count + 1
    });

    return {
      statusCode: 200,
      message: 'Movie details',
      data
    };
  }

  async update(
    id: string,
    dto: UpdateMovieDto,
    poster?: Express.Multer.File,
  ): Promise<Isuccess> {
    const movie = (await this.conflict.mustExist({ id }, this.movieRepo, 'Movie', 'ID')) as Movie;

    const updateData: Partial<Movie> = {
      title: dto.title ?? movie.title,
      description: dto.description ?? movie.description,
      release_year: dto.release_year ?? movie.release_year,
      duration_minutes: dto.duration_minutes ?? movie.duration_minutes,
      subscription_type: dto.subscription_type ?? movie.subscription_type,
      rating: dto.rating ?? movie.rating
    };

    if (dto.title) {
      const slug = slugify(dto.title, { lower: true, strict: true });
      await this.conflict.mustBeUniqueOnUpdate(id, { slug }, this.movieRepo, 'Movie', 'title');
      updateData.slug = slug;
    }

    if (poster) {
      updateData.poster_url = await this.r2Service.upload(poster, 'posters');
      if (movie.poster_url) {
        await this.r2Service.delete(movie.poster_url);
      }
    }

    if (dto.category_ids) {
      const categories = await this.categoryRepo.find({ where: { id: In(dto.category_ids) } });
      if (categories.length !== dto.category_ids.length) {
        throw new BadRequestException('One or more category_ids are invalid');
      }

      await this.movieCategoryRepo.delete({ movie })
      categories.map(async (category) => {
        let movieCategory = await this.movieCategoryRepo.create({
          movie,
          category
        });
        await this.movieCategoryRepo.save(movieCategory)
      })
    }

    await this.movieRepo.update(id, updateData);
    const updated = await this.movieRepo.findOne({ where: { id }, relations: { movie_categories: true } }) as Movie;

    return {
      statusCode: 200,
      message: 'Movie has been updated successfully',
      data: updated,
    };
  }

  async remove(id: string): Promise<Isuccess> {
    const movie = await this.conflict.mustExist({ id }, this.movieRepo, 'Movie', 'ID') as Movie;
    if (movie.poster_url) {
      await this.r2Service.delete(movie.poster_url);
    }
    await this.movieRepo.delete({ id });

    return {
      statusCode: 200,
      message: 'Movie has been deleted successfully',
      data: {},
    };
  }

  // --- Movie files ---

  async addFile(
    movieId: string,
    dto: CreateMovieFileDto,
    file: Express.Multer.File,
  ): Promise<Isuccess> {
    const movie = await this.conflict.mustExist({ id: movieId }, this.movieRepo, 'Movie', 'ID') as Movie;

    if (!file) throw new BadRequestException('Video file is required');

    const movieFile = this.movieFileRepo.create({
      movie,
      file_url: await this.r2Service.upload(file, 'movies'),
      quality: dto.quality,
      language: dto.language ?? 'uz',
    });

    const saved = await this.movieFileRepo.save(movieFile);

    return {
      statusCode: 201,
      message: 'Movie file has been uploaded successfully',
      data: saved,
    };
  }


  async updateFile(id: string, dto: UpdateMovieFileDto): Promise<Isuccess> {
    const movieFile = await this.conflict.mustExist({ id }, this.movieFileRepo, "Movie File", 'ID') as MovieFile

    let updatedData: Partial<MovieFile> = {
      language: dto?.language,
      quality: dto?.quality,
    }

    await this.movieFileRepo.update({ id }, updatedData);

    let movieWithFile = await this.movieFileRepo.findOne({
      where: { id }
    }) as MovieFile

    return {
      statusCode: 200,
      message: "Movie File has been updated successfully",
      data: movieWithFile
    }
  }
  async removeFile(fileId: string): Promise<Isuccess> {
    const movieFile = await this.conflict.mustExist({ id: fileId }, this.movieFileRepo, 'MovieFile', 'ID') as MovieFile;
    if (movieFile.file_url) {
      await this.r2Service.delete(movieFile.file_url);
    }
    await this.movieFileRepo.delete({ id: fileId });

    return {
      statusCode: 200,
      message: 'Movie file has been deleted successfully',
      data: {},
    };
  }

  // Reviews
  async createReview(userId: string, movieId: string, dto: CreateReviewDto): Promise<Isuccess> {

    let user = await this.conflict.mustExist({ id: userId }, this.userRepo, "User", "ID") as User;

    let movie = await this.conflict.mustExist({ id: movieId }, this.movieRepo, 'Movie', 'ID') as Movie;

    let { rating, comment } = dto;

    let review = this.reviewRepo.create({
      comment,
      rating,
      user,
      movie
    });


    let savedReview = await this.reviewRepo.save(review);

    let data = {
      id: savedReview.id,
      user: {
        id: user.id,
        username: user.username
      },
      movie_id: movie.id,
      rating,
      comment,
      created_at: savedReview.created_at
    };

    return {
      statusCode: 201,
      message: "Review added sucsessfully",
      data
    }
  }

  async deleteReview(userId: string, movieId: string, reviewId: string): Promise<Isuccess> {

    let movie = await this.conflict.mustExist({ id: movieId }, this.movieRepo, 'Movie', "ID") as Movie;

    let review = await this.reviewRepo.findOne({
      where: { id: reviewId },
      relations: {
        user: true,
        movie: true
      }
    });

    if (!review) throw new NotFoundException("Review with this ID  is not found");
    if (review.movie.id !== movieId) throw new BadRequestException("You have no review for this movie");

    await this.reviewRepo.delete({ id: reviewId });
    return {
      statusCode: 200,
      message: "Review deleted successfully",
      data: {}
    }
  }
}