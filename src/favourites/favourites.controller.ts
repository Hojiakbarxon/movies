import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { FavouritesService } from './favourites.service';
import { CreateFavouriteDto } from './dto/create-favourite.dto';
import { AuthGuard } from '../auth/guards/auth/auth.guard';

@Controller('favourites')
@UseGuards(AuthGuard)
export class FavouritesController {
  constructor(private readonly favouritesService: FavouritesService) { }

  @Post()
  create(@Body() createFavouriteDto: CreateFavouriteDto, @Req() req) {
    return this.favouritesService.create(createFavouriteDto, req.user.id);
  }

  @Get()
  findAll(@Req() req) {
    return this.favouritesService.findAll(req.user.id);
  }

  @Delete(':movie_id')
  remove(@Param('movie_id') movie_id: string, @Req() req) {
    return this.favouritesService.remove(req.user.id, movie_id);
  }
}
