import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { VideoQuality } from '../entities/movie-file.entity';

export class CreateMovieFileDto {
  @IsNotEmpty()
  @IsEnum(VideoQuality)
  quality: VideoQuality;

  @IsOptional()
  @IsString()
  language?: string;
}