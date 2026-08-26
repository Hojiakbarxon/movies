import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Isuccess } from '../utils/success-response-interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { avatarMulterOptions } from '../utils/multer.config';
import { AuthGuard } from '../auth/guards/auth/auth.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from './entities/user.entity';
import { RoleGuard } from '../auth/guards/role/role.guard';
import { OwnershipGuard } from '../auth/guards/ownership/ownership.guard';

@Controller('users')
@UseGuards(AuthGuard, RoleGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // Superadmin admin
  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @UseInterceptors(FileInterceptor("avatar", avatarMulterOptions))
  create(@Body() dto: CreateUserDto, @UploadedFile() avatar?: Express.Multer.File): Promise<Isuccess> {
    return this.usersService.create(dto, avatar);
  }

  @Post("admin")
  @Roles(UserRole.SUPERADMIN)
  @UseInterceptors(FileInterceptor("avatar", avatarMulterOptions))
  createAdmin(
    @Body() dto: CreateUserDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ): Promise<Isuccess> {
    return this.usersService.createAdmin(dto, UserRole.ADMIN, avatar);
  }

  // Admin, Superadmin
  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  findAll(): Promise<Isuccess> {
    return this.usersService.findAll();
  };

  // Superadmin
  @Get('email/:email')
  @Roles(UserRole.SUPERADMIN)
  findByEmailWithPassword(@Param('email') email: string): Promise<Isuccess> {
    return this.usersService.findByEmailWithPassword(email);
  };

  // Admin, Superadmin, Owner
  @Get(':userId')
  @UseGuards(OwnershipGuard)
  findOne(@Param('userId', ParseUUIDPipe) userId: string): Promise<Isuccess> {
    return this.usersService.findOne(userId);
  };

  //Superadmin, Admin, Owner
  @Patch(':userId')
  @UseGuards(OwnershipGuard)
  @UseInterceptors(FileInterceptor("avatar", avatarMulterOptions))
  update(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateUserDto,
    @UploadedFile() avatar?: Express.Multer.File
  ): Promise<Isuccess> {
    return this.usersService.update(userId, dto, avatar);
  }

  //Superadmin, Admin, Owner
  @Patch(':userId/profile')
  @UseGuards(OwnershipGuard)
  updateProfile(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<Isuccess> {
    return this.usersService.updateProfile(userId, dto);
  }

  // Superadmin
  @Delete(':userId')
  @UseGuards(OwnershipGuard)
  remove(@Param('userId', ParseUUIDPipe) userId: string): Promise<Isuccess> {
    return this.usersService.remove(userId);
  }
}