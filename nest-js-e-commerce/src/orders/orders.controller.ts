import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

@Get()
  getMyOrders(@Req() req) {
    return this.ordersService.getMyOrders(req.user.id);
  }

  // GET /orders/:id
  @Get(':id')
  getOrder(@Req() req, @Param('id') id: string) {
    return this.ordersService.getOrderById(req.user.id, id);
  }

@Post()
createOrder(@Req() req) {
  return this.ordersService.createOrder(req.user.id);
}


}
