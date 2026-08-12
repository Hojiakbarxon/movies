import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import slugify from 'slugify';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Isuccess } from '../utils/success-response-interface';
import { Conflict } from '../utils/conflict';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    private readonly conflict: Conflict,
  ) { }

  async create(dto: CreateCategoryDto): Promise<Isuccess> {
    const slug = slugify(dto.name, { lower: true, strict: true });
    await this.conflict.mustBeUnique({ slug }, this.categoryRepo, 'Category', 'name');

    const category = this.categoryRepo.create({ ...dto, slug });
    const savedCategory = await this.categoryRepo.save(category);

    return {
      statusCode: 201,
      message: 'Category has been created successfully',
      data: savedCategory,
    };
  }

  async findAll(): Promise<Isuccess> {
    const categories = await this.categoryRepo.find();

    return {
      statusCode: 200,
      message: 'All categories',
      data: categories,
    };
  }

  async findOne(id: string): Promise<Isuccess> {
    const category = await this.conflict.mustExist({ id }, this.categoryRepo, 'Category', 'ID');

    return {
      statusCode: 200,
      message: 'Category with the given UUID',
      data: category,
    };
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Isuccess> {
    await this.conflict.mustExist({ id }, this.categoryRepo, 'Category', 'ID');

    const updateData: Partial<Category> = { ...dto };
    if (dto.name) {
      const slug = slugify(dto.name, { lower: true, strict: true });
      await this.conflict.mustBeUniqueOnUpdate(id, { slug }, this.categoryRepo, 'Category', 'name');
      updateData.slug = slug;
    }

    await this.categoryRepo.update(id, updateData);
    const updated = await this.categoryRepo.findOne({ where: { id } }) as Category;

    return {
      statusCode: 200,
      message: 'Category has been updated successfully',
      data: updated,
    };
  }

  async remove(id: string): Promise<Isuccess> {
    await this.conflict.mustExist({ id }, this.categoryRepo, 'Category', 'ID');
    await this.categoryRepo.delete({ id });

    return {
      statusCode: 200,
      message: 'Category has been deleted successfully',
      data: {},
    };
  }
}