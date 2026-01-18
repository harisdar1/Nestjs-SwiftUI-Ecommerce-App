// src/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  // CREATE
async create(createProductDto: CreateProductDto): Promise<Product> {
  // Solution: Use TypeORM's save() method directly
  return this.productsRepository.save({
    name: createProductDto.name,
    description: createProductDto.description,
    price: createProductDto.price,
    stock: createProductDto.stock,
    imageUrl: createProductDto.imageUrl,
    category: createProductDto.categoryId 
      ? { id: createProductDto.categoryId }
      : undefined,
  });
}

  // READ ALL
  async findAll(): Promise<Product[]> {
    return this.productsRepository.find({
      relations: ['category'], // Include category data
    });
  }

  // READ ONE
  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    return product;
  }

  // UPDATE
async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
  const product = await this.findOne(id);
  
  // Update basic fields
  if (updateProductDto.name !== undefined) product.name = updateProductDto.name;
  if (updateProductDto.description !== undefined) product.description = updateProductDto.description;
  if (updateProductDto.price !== undefined) product.price = updateProductDto.price;
  if (updateProductDto.stock !== undefined) product.stock = updateProductDto.stock;
  if (updateProductDto.imageUrl !== undefined) product.imageUrl = updateProductDto.imageUrl;
  
  // Handle category update
  if (updateProductDto.categoryId !== undefined) {
    if (updateProductDto.categoryId) {
      // Set category with just the ID
      product.category = { id: updateProductDto.categoryId } as any;
    } else {
      // Remove category (set to null)
      product.category = null as any;
    }
  }
  
  return this.productsRepository.save(product);
}
  // DELETE
  async remove(id: string): Promise<void> {
    const result = await this.productsRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
}