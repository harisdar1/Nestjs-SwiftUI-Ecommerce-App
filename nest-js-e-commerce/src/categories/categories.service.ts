import { Controller, NotFoundException } from '@nestjs/common';

// src/categories/categories.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  // CREATE
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoriesRepository.create(createCategoryDto);
    return this.categoriesRepository.save(category);
  }

  // READ ALL
  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find();
  }

  // READ ONE
async findOne(id: string): Promise<Category> {
  const category = await this.categoriesRepository.findOne({ where: { id } });
  
  if (!category) {
    throw new NotFoundException(`Category with ID ${id} not found`);
  }
  
  return category;
}
  // UPDATE
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    await this.categoriesRepository.update(id, updateCategoryDto);
    return this.findOne(id);
  }

  // DELETE
  async remove(id: string): Promise<void> {
    await this.categoriesRepository.delete(id);
  }
}