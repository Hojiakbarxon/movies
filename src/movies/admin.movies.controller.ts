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
import { RoleGuard } from '../auth/guards/role/role.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateMovieCastDto } from './dto/create-movie-cast.dto';
import { TmdbService } from '../utils/TMDB.service';
import { ConnectTmdbMovieDto } from './dto/connect-tmdb-movie.dto';

@Controller('admin')
@UseGuards(AuthGuard, RoleGuard)
export class AdminMoviesController {
    constructor(
        private readonly moviesService: MoviesService,
        private readonly tmdbService: TmdbService
    ) { }

    @Post('movies')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    @UseInterceptors(FileInterceptor('poster', posterMulterOptions))
    create(
        @Body() rawDto: any,
        @Req() req,
        @UploadedFile() poster?: Express.Multer.File,
    ): Promise<Isuccess> {
        // category_ids arrives as a JSON string in multipart form-data — parse it
        const dto: CreateMovieDto = {
            ...rawDto,
            category_ids: this.parseCategoryIds(rawDto.category_ids),
        };

        return this.moviesService.create(dto, req.user.id, poster);
    }

    @Get('movies/tmdb/search')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    searchTmdbMovies(
        @Query('query') query: string,
    ) {
        return this.tmdbService.searchMovies(query);
    }

    @Get('movies/:id/tmdb/cast')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    getTmdbCast(
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.moviesService.getTmdbCast(id);
    }

    
    @Get('movies')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    findAll(): Promise<Isuccess> {
        return this.moviesService.findAllForAdmin();
    }


    @Patch('movies/:id/tmdb')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    connectTmdbMovie(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: ConnectTmdbMovieDto,
    ): Promise<Isuccess> {
        return this.moviesService.connectTmdbMovie(id, dto.tmdbId);
    }

    @Patch('movies/:id')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    @UseInterceptors(FileInterceptor('poster', posterMulterOptions))
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() rawDto: any,
        @UploadedFile() poster?: Express.Multer.File,
    ): Promise<Isuccess> {
        const dto: UpdateMovieDto = {
            ...rawDto,
            category_ids: rawDto.category_ids ? this.parseCategoryIds(rawDto.category_ids) : undefined,
        };
        return this.moviesService.update(id, dto, poster);
    }

    @Delete('movies/:id')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    @HttpCode(200)
    remove(@Param('id', ParseUUIDPipe) id: string): Promise<Isuccess> {
        return this.moviesService.remove(id);
    }

    @Post('movies/:id/add-actor')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    addActor(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: CreateMovieCastDto
    ): Promise<Isuccess> {
        return this.moviesService.addActor(id, dto)
    }

    @Post('movies/:id/files')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    @UseInterceptors(FileInterceptor('file', movieFileMulterOptions))
    addFile(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: CreateMovieFileDto,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<Isuccess> {
        return this.moviesService.addFile(id, dto, file);
    }

    @Patch("movies/files/:fileId")
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    updateFile(@Param('fileId', ParseUUIDPipe) fileId: string, @Body() dto: UpdateMovieFileDto): Promise<Isuccess> {
        return this.moviesService.updateFile(fileId, dto)
    }

    @Delete('movies/files/:fileId')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    @HttpCode(200)
    removeFile(@Param('fileId', ParseUUIDPipe) fileId: string): Promise<Isuccess> {
        return this.moviesService.removeFile(fileId);
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

