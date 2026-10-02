import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SourceType, VideoQuality } from '../entities/movie-file.entity';

export class CreateMovieFileDto {
  @IsEnum(VideoQuality)
  @IsNotEmpty()
  quality: VideoQuality;

  @IsString()
  @IsOptional()
  language?: string;

  @IsEnum(SourceType)
  @IsNotEmpty()
  source_type: SourceType;

  @IsString()
  @IsOptional()
  external_url: string
}