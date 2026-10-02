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
  UseGuards,
} from '@nestjs/common';
import { SubscriptionPlansService } from './subscriptions-plans.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { Isuccess } from '../utils/success-response-interface';
import { AuthGuard } from '../auth/guards/auth/auth.guard';
import { RoleGuard } from '../auth/guards/role/role.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('subscription-plans')
export class SubscriptionPlansController {
  constructor(private readonly plansService: SubscriptionPlansService) {}

  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN)
  create(@Body() dto: CreateSubscriptionPlanDto): Promise<Isuccess> {
    return this.plansService.create(dto);
  }

  @Get()
  findActive(): Promise<Isuccess> {
    return this.plansService.findActive();
  }

  @Get('all')
  findAll(): Promise<Isuccess> {
    return this.plansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Isuccess> {
    return this.plansService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubscriptionPlanDto,
  ): Promise<Isuccess> {
    return this.plansService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN)
  @HttpCode(200)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<Isuccess> {
    return this.plansService.remove(id);
  }
}