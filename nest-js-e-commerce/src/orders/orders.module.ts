import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Cart } from '../carts/entities/cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Cart])],
  controllers: [OrdersController],
  providers: [OrdersService]
})
export class OrdersModule {}
