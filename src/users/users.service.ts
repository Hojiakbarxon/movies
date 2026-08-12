import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Crypto } from '../utils/Crypto';
import { Isuccess } from '../utils/success-response-interface';
import { Conflict } from '../utils/conflict';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { envConfig } from '../utils/env.config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    private readonly crypto: Crypto,
    private readonly conflict: Conflict
  ) { }

  async create(dto: CreateUserDto, avatar?: Express.Multer.File): Promise<Isuccess> {
    let { email, password, username } = dto
    await this.conflict.mustBeUnique({ email }, this.userRepo, 'User', "email");

    await this.conflict.mustBeUnique({ username }, this.userRepo, 'User', "username");

    const password_hash = await this.crypto.hash(password);

    const user = this.userRepo.create({
      username,
      email,
      password_hash,
      avatar_url: avatar ? `uploads/avatars/${avatar.filename}` : undefined
    });

    const savedUser = await this.userRepo.save(user);

    const profile = this.profileRepo.create({ user: savedUser });
    await this.profileRepo.save(profile);

    return {
      statusCode: 201,
      message: "User has been created successfully",
      data: user
    }
  }

  async createAdmin(dto: CreateUserDto, role: UserRole, avatar?: Express.Multer.File): Promise<Isuccess> {
    let { email, password, username } = dto
    await this.conflict.mustBeUnique({ email }, this.userRepo, 'User', "email");

    await this.conflict.mustBeUnique({ username }, this.userRepo, 'User', "username");

    const password_hash = await this.crypto.hash(password);

    const user = this.userRepo.create({
      username,
      email,
      password_hash,
      avatar_url: avatar ? `uploads/avatars/${avatar.filename}` : undefined,
      role
    });


    const savedUser = await this.userRepo.save(user);

    const profile = this.profileRepo.create({ user: savedUser });
    await this.profileRepo.save(profile);

    return {
      statusCode: 201,
      message: "Admin-user has been created successfully",
      data: user
    }
  }

  async createSuperAdmin(): Promise<string> {
    let existedSuperAdmin = await this.userRepo.findOne({
      where: { role: UserRole.SUPERADMIN }
    });

    if (existedSuperAdmin) return "SuperAdmin exists"

    let password_hash = await this.crypto.hash(envConfig.superadmin.password);

    let superAdmin = await this.userRepo.create({
      email: envConfig.superadmin.email,
      username: envConfig.superadmin.username,
      password_hash,
      role: UserRole.SUPERADMIN
    })

    let savedUser = await this.userRepo.save(superAdmin);

    let profile = await this.profileRepo.create({ user: savedUser });
    await this.profileRepo.save(profile);

    return 'SuperAdmin created successfully'
  }

  async findAll(): Promise<Isuccess> {
    const users = await this.userRepo.find({
      relations: {
        profile: true
      }
    });

    return {
      statusCode: 200,
      message: "All users",
      data: users
    }
  }

  async findOne(id: string): Promise<Isuccess> {
    await this.conflict.mustExist({ id }, this.userRepo, 'User', "ID");

    const user = await this.userRepo.findOne({
      where: { id },
      relations: {
        profile: true
      }
    }) as User;

    return {
      statusCode: 200,
      message: "User with the given UUID",
      data: user
    }
  }

  // used internally by auth module for login — includes password_hash
  async findByEmailWithPassword(email: string): Promise<Isuccess> {
    const user = await this.userRepo.findOne({
      where: { email },
      select: {
        id: true,
        username: true,
        avatar_url: true,
        password_hash: true,
        role: true
      },
    });

    if (!user) throw new NotFoundException("Email or Password is wrong!");

    return {
      statusCode: 200,
      message: "User is found successfully",
      data: user
    }
  }

  async update(id: string, dto: UpdateUserDto, avatar?: Express.Multer.File): Promise<Isuccess> {
    let { email, username } = dto;
    const user = await this.conflict.mustExist({ id }, this.userRepo, 'User', 'ID') as User;

    if (email) await this.conflict.mustBeUniqueOnUpdate(id, { email }, this.userRepo, "User", "email");

    if (username) await this.conflict.mustBeUniqueOnUpdate(id, { username }, this.userRepo, "User", "email");

    const updateData: Partial<User> = {
      email: dto.email ? dto.email : user.email,
      username: dto.username ? dto.username : user.username
    };

    if (avatar) {
      if (user.avatar_url) {
        const oldAvatarPath = join(process.cwd(), user.avatar_url);
        await unlink(oldAvatarPath);
      }
      updateData.avatar_url = `uploads/avatars/${avatar.filename}`;
    }

    const updatedUser = await this.userRepo.update(id, { ...updateData });

    return this.findOne(id);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<Isuccess> {
    const profile = await this.conflict.mustExist({ user: { id: userId } }, this.profileRepo, 'Profile', "ID") as Profile;

    const updateData: Partial<Profile> = {
      full_name: dto?.full_name ? dto.full_name : profile.full_name,
      country: dto.country ? dto.country : profile.country,
      phone: dto.phone ? dto.phone : profile.phone
    };

    const updatedProfile = await this.profileRepo.update(profile.id, {
      ...updateData
    });

    return {
      statusCode: 200,
      message: "Profile has been updated successfully",
      data: updatedProfile
    };
  }

  async remove(id: string): Promise<Isuccess> {
    const user = await this.conflict.mustExist({ id }, this.userRepo, 'User', "ID") as User;
    await this.userRepo.delete({ id });

    if (user.avatar_url) {
      let oldAvatarPath = join(process.cwd(), user.avatar_url);
      await unlink(oldAvatarPath);
    };

    return {
      statusCode: 200,
      message: "User has been deleted successfully",
      data: {}
    }
  }
}