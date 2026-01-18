import { Module } from '@nestjs/common';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { ProductsModule } from 'src/products/products.module';

@Module({
    imports: [
    TypeOrmModule.forFeature([Cart]), // Register Cart entity
    ProductsModule, // Need products service
  ],
  controllers: [CartsController],
  providers: [CartsService]
})
export class CartsModule {}
