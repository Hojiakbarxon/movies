import { PartialType } from '@nestjs/mapped-types';
import { CreateMovieFileDto } from './create-movie-file.dto';


export class UpdateMovieFileDto extends PartialType(CreateMovieFileDto) { }