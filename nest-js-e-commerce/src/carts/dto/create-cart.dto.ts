import { IsNotEmpty, IsUUID, IsInt, Min } from 'class-validator';

export class CartItemDto {
  @IsUUID('4', { message: 'Product ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Product ID is required' })
  productId: string;

  @IsInt({ message: 'Quantity must be a whole number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}
