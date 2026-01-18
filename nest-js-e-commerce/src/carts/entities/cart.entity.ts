import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ONLY 1 RELATIONSHIP: to User
  @OneToOne(() => User, (user) => user.cart)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // NOT a relationship - just JSON data
  @Column('simple-json', { nullable: true })
  items: Array<{
    productId: string;   // Store ID as string
    productName: string; // Copy product name
    quantity: number;
    price: number;       // Copy price at time of adding
  }>;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}