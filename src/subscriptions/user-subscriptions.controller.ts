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
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserSubscriptionsService } from './user-subscriptions.service';
import { PurchaseSubscriptionDto } from './dto/purchase-subscription.dto';
import { UpdateUserSubscriptionDto } from './dto/update-user-subscription.dto';
import { Isuccess } from '../utils/success-response-interface';
import { AuthGuard } from '../auth/guards/auth/auth.guard';
import { RoleGuard } from '../auth/guards/role/role.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../users/entities/user.entity';
import { OwnershipGuard } from '../auth/guards/ownership/ownership.guard';

@Controller('user-subscriptions')
@UseGuards(AuthGuard, RoleGuard)
export class UserSubscriptionsController {
  constructor(private readonly userSubsService: UserSubscriptionsService) { }

  @Post('purchase')
  purchase(
    @Body() dto: PurchaseSubscriptionDto,
    @Req() req
  ): Promise<Isuccess> {
    return this.userSubsService.purchase(req.user.id, dto);
  }

  @Get()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  findAll(): Promise<Isuccess> {
    return this.userSubsService.findAll();
  }

  @Get('user/:userId')
  @UseGuards(OwnershipGuard)
  findByUser(@Param('userId', ParseUUIDPipe) userId: string): Promise<Isuccess> {
    return this.userSubsService.findByUser(userId);
  }

  @Get(':userSubId')
  @UseGuards(OwnershipGuard)
  findOne(@Param('userSubId', ParseUUIDPipe) userSubId: string): Promise<Isuccess> {
    return this.userSubsService.findOne(userSubId);
  }

  @Patch(':userSubId')
  @UseGuards(OwnershipGuard)
  update(
    @Param('userSubId', ParseUUIDPipe) userSubId: string,
    @Body() dto: UpdateUserSubscriptionDto,
  ): Promise<Isuccess> {
    return this.userSubsService.update(userSubId, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @HttpCode(200)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<Isuccess> {
    return this.userSubsService.remove(id);
  }
}