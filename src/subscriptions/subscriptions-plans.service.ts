import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { Isuccess } from '../utils/success-response-interface';
import { Conflict } from '../utils/conflict';

@Injectable()
export class SubscriptionPlansService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
    private readonly conflict: Conflict,
  ) { }

  async create(dto: CreateSubscriptionPlanDto): Promise<Isuccess> {
    await this.conflict.mustBeUnique({ name: dto.name }, this.planRepo, 'SubscriptionPlan', 'name');

    const plan = this.planRepo.create(dto);
    const savedPlan = await this.planRepo.save(plan);

    return {
      statusCode: 201,
      message: 'Subscription plan has been created successfully',
      data: savedPlan,
    };
  }

  async findAll(): Promise<Isuccess> {
    const plans = await this.planRepo.find();

    return {
      statusCode: 200,
      message: 'All subscription plans',
      data: plans,
    };
  }

  async findActive(): Promise<Isuccess> {
    const plans = await this.planRepo.find({ where: { is_active: true } });

    return {
      statusCode: 200,
      message: 'Active subscription plans',
      data: plans,
    };
  }

  async findOne(id: string): Promise<Isuccess> {
    const plan = await this.conflict.mustExist({ id }, this.planRepo, 'SubscriptionPlan', 'ID');

    return {
      statusCode: 200,
      message: 'Subscription plan with the given UUID',
      data: plan,
    };
  }

  async update(id: string, dto: UpdateSubscriptionPlanDto): Promise<Isuccess> {
    await this.conflict.mustExist({ id }, this.planRepo, 'SubscriptionPlan', 'ID');

    if (dto.name) {
      await this.conflict.mustBeUniqueOnUpdate(id, { name: dto.name }, this.planRepo, 'SubscriptionPlan', 'name');
    }

    await this.planRepo.update(id, { ...dto });
    const updatedPlan = await this.planRepo.findOne({ where: { id } }) as SubscriptionPlan;

    return {
      statusCode: 200,
      message: 'Subscription plan has been updated successfully',
      data: updatedPlan,
    };
  }

  async remove(id: string): Promise<Isuccess> {
    await this.conflict.mustExist({ id }, this.planRepo, 'SubscriptionPlan', 'ID');
    await this.planRepo.delete({ id });

    return {
      statusCode: 200,
      message: 'Subscription plan has been deleted successfully',
      data: {},
    };
  }
}