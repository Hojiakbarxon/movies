import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Isuccess } from '../utils/success-response-interface';
import { AuthGuard } from '../auth/guards/auth/auth.guard';
import { RoleGuard } from '../auth/guards/role/role.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../users/entities/user.entity';
import { OwnershipGuard } from '../auth/guards/ownership/ownership.guard';

@Controller('payments')
@UseGuards(AuthGuard, RoleGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Post()
  pay(@Body() dto: CreatePaymentDto): Promise<Isuccess> {
    return this.paymentsService.pay(dto);
  }

  @Get()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  findAll(): Promise<Isuccess> {
    return this.paymentsService.findAll();
  }

  @Get(':payment_id')
  @UseGuards(OwnershipGuard)
  findOne(@Param('payment_id', ParseUUIDPipe) payment_id: string): Promise<Isuccess> {
    return this.paymentsService.findOne(payment_id);
  }

  @Patch(':payment_id/refund')
  @UseGuards(OwnershipGuard)
  refund(@Param('payment_id', ParseUUIDPipe) payment_id: string): Promise<Isuccess> {
    return this.paymentsService.refund(payment_id);
  }
}