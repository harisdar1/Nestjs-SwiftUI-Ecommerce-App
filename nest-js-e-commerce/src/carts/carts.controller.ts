
import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { CartsService } from './carts.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CartItemDto } from './dto/create-cart.dto';


@Controller('carts')
@UseGuards(JwtAuthGuard) 
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

@Get('my-cart')
getMyCart(@Req() req) {
  // req.user.id comes from JWT token
  return this.cartsService.getUserCart(req.user.id);
}

@Post('add')
addToCart(@Req() req, @Body() cartItemDto: CartItemDto) {
  return this.cartsService.addOrUpdateItem(req.user.id, cartItemDto);
}

@Delete('remove/:productId')
removeFromCart(@Req() req, @Param('productId') productId: string) {
  return this.cartsService.removeItem(req.user.id, productId);
}

@Delete('clear')
clearCart(@Req() req) {
  return this.cartsService.clearCart(req.user.id);
}


}