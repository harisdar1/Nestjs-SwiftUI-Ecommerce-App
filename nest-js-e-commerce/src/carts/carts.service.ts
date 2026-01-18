import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Repository } from 'typeorm';
import { ProductsService } from 'src/products/products.service';
import { CartItemDto } from './dto/create-cart.dto';

@Injectable()
export class CartsService {
    constructor(
    @InjectRepository(Cart)
    private cartsRepository: Repository<Cart>,
    private productsService: ProductsService, // We need product info
  ) {}


  // Inside CartsService class
async getUserCart(userId: string): Promise<Cart> {
  // Find cart for this user
  let cart = await this.cartsRepository.findOne({
    where: { user: { id: userId } },
  });

  // If no cart exists, create one
  if (!cart) {
    cart = this.cartsRepository.create({
      user: { id: userId },
      items: [], // Start with empty array
      total: 0,
    });
    cart = await this.cartsRepository.save(cart);
  }

  return cart;
}


// Inside CartsService class
calculateCartTotal(cart: Cart): void {
  if (!cart.items || cart.items.length === 0) {
    cart.total = 0;
    return;
  }

  // Sum: price × quantity for each item
  cart.total = cart.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
}

// Inside CartsService class
async addOrUpdateItem(userId: string, cartItemDto: CartItemDto): Promise<Cart> {
  // 1. Get user's cart
  const cart = await this.getUserCart(userId);
  
  // 2. Get product details
  const product = await this.productsService.findOne(cartItemDto.productId);
  
  // 3. Initialize items array if empty
  cart.items = cart.items || [];
  
  // 4. Check if product already in cart
  const existingItemIndex = cart.items.findIndex(
    item => item.productId === cartItemDto.productId
  );
  
  if (existingItemIndex >= 0) {
    // Update existing item quantity
    cart.items[existingItemIndex].quantity += cartItemDto.quantity;
  } else {
    // Add new item
    cart.items.push({
      productId: product.id,
      productName: product.name,
      quantity: cartItemDto.quantity,
      price: product.price,
    });
  }
  
  // 5. Recalculate total
  this.calculateCartTotal(cart);
  
  // 6. Save and return
  return this.cartsRepository.save(cart);
}

// Inside CartsService class
async removeItem(userId: string, productId: string): Promise<Cart> {
  const cart = await this.getUserCart(userId);
  
  if (!cart.items || cart.items.length === 0) {
    throw new NotFoundException('Cart is empty');
  }
  
  // Remove item with matching productId
  cart.items = cart.items.filter(item => item.productId !== productId);
  
  // Recalculate total
  this.calculateCartTotal(cart);
  
  return this.cartsRepository.save(cart);
}

// Inside CartsService class
async clearCart(userId: string): Promise<Cart> {
  const cart = await this.getUserCart(userId);
  
  cart.items = [];
  cart.total = 0;
  
  return this.cartsRepository.save(cart);
}
  
}
