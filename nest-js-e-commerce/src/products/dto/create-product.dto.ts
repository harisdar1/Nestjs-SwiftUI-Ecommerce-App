import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsUrl,
  IsUUID,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Product name is required' })
  @MaxLength(200, { message: 'Product name must not exceed 200 characters' })
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  description?: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price must be a valid number with up to 2 decimal places' },
  )
  @Min(0, { message: 'Price must be a positive number' })
  price: number;

  @IsNumber({}, { message: 'Stock must be a valid number' })
  @Min(0, { message: 'Stock cannot be negative' })
  stock: number;

  @IsUrl({}, { message: 'Image URL must be a valid URL' })
  @IsOptional()
  imageUrl?: string;

  @IsUUID('4', { message: 'Category ID must be a valid UUID' })
  @IsOptional()
  categoryId?: string;
}
