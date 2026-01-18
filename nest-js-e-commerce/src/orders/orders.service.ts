import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Cart } from 'src/carts/entities/cart.entity';

@Injectable()
export class OrdersService {
      constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,

  ) {}

async getMyOrders(userId: string) {
    return this.orderRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  // Get single order
  async getOrderById(userId: string, orderId: string) {
    const order = await this.orderRepo.findOne({
      where: {
        id: orderId,
        user: { id: userId },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
async createOrder(userId: string) {
  // 1. Find cart
  const cart = await this.cartRepo.findOne({
    where: { user: { id: userId } },
  });

  if (!cart || !cart.items || cart.items.length === 0) {
    throw new BadRequestException('Cart is empty');
  }

  // 2. Create order
  const order = this.orderRepo.create({
    user: { id: userId },
    items: cart.items,
    total: cart.total,
    status: 'pending',
  });

  await this.orderRepo.save(order);

  // 3. Clear cart
  cart.items = [];
  cart.total = 0;
  await this.cartRepo.save(cart);

  return order;
}


  
}
