import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

// PartialType makes all fields from CreateCategoryDto optional
// and keeps all the validation decorators
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
