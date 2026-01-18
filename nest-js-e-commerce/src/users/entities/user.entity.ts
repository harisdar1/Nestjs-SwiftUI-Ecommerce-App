import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  OneToOne,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Cart } from 'src/carts/entities/cart.entity';

// Enum for user roles - keeps our role values consistent
export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

@Entity('users') // This decorator tells TypeORM: "This class = a database table called 'users'"
export class User {
  @PrimaryGeneratedColumn('uuid') // Auto-generates a unique UUID for each user
  id: string;

  @Column({ unique: true }) // unique: true = no two users can have same email
  email: string;

  @Column()
  password: string; // Will be hashed, never stored as plain text

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER, // New users are customers by default
  })
  role: UserRole;

    @OneToOne(() => Cart, (cart) => cart.user, { cascade: true })
  cart: Cart; 

  @CreateDateColumn() // Automatically set when row is created
  createdAt: Date;

  @UpdateDateColumn() // Automatically updated when row changes
  updatedAt: Date;

  // This runs BEFORE inserting a new user into the database
  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10); // 10 = salt rounds
  }
}
