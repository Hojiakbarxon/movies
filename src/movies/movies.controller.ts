import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { CreateMovieFileDto } from './dto/create-movie-file.dto';
import { Isuccess } from '../utils/success-response-interface';
import { posterMulterOptions, movieFileMulterOptions } from '../utils/multer.config';
import { UpdateMovieFileDto } from './dto/update-movie-file.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { AuthGuard } from '../auth/guards/auth/auth.guard';
import { OwnershipGuard } from '../auth/guards/ownership/ownership.guard';
import { SubscriptionGuard } from '../auth/guards/subscription/subscription.guard';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) { }

  @Post(":movie_id/reviews")
  @UseGuards(AuthGuard)
  createReview(
    @Param('movie_id', ParseUUIDPipe) movie_id: string,
    @Body() dto: CreateReviewDto,
    @Req() req
  ): Promise<Isuccess> {
    return this.moviesService.createReview(req.user.id, movie_id, dto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('subscription_type') subscription_type?: string,
  ): Promise<Isuccess> {
    return this.moviesService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      category,
      search,
      subscription_type,
    );
  }

  @Get(':slug')
  @UseGuards(AuthGuard, SubscriptionGuard)
  findBySlug(@Param('slug') slug: string, @Req() req): Promise<Isuccess> {
    return this.moviesService.findBySlug(slug, req.canWatch);
  }

  @Delete(":movie_id/reviews/:review_id")
  @UseGuards(AuthGuard, OwnershipGuard)
  deleteReview(
    @Param("movie_id", ParseUUIDPipe) movie_id: string,
    @Param("review_id", ParseUUIDPipe) review_id: string,
    @Req() req
  ): Promise<Isuccess> {
    return this.moviesService.deleteReview(req.user.id, movie_id, review_id);
  }
  
  private parseCategoryIds(raw: any): string[] {
    if (Array.isArray(raw)) return raw;
    try {
      return JSON.parse(raw);
    } catch {
      throw new BadRequestException('category_ids must be a valid JSON array');
    }
  }
}

