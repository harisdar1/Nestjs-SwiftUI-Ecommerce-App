import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // This registers User entity for this module
  ],                                   // AND makes it available to autoLoadEntities
  controllers: [],
  providers: [],
  exports: [TypeOrmModule], // Export so other modules can use User repository
})
export class UsersModule {}
