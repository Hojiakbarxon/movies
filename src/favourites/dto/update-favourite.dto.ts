import { PartialType } from '@nestjs/mapped-types';
import { CreateFavouriteDto } from './create-favourite.dto';

export class UpdateFavouriteDto extends PartialType(CreateFavouriteDto) {}
