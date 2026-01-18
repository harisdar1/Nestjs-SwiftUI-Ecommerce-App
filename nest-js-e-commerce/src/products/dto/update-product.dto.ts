import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

// PartialType makes all fields from CreateProductDto optional
// and keeps all the validation decorators
export class UpdateProductDto extends PartialType(CreateProductDto) {}
