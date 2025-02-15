import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  
  import User from './User';
  import HealthUnit from './HealthUnit';
  
  export interface IReview {
    id: number;
    user_id: number;
    health_unit_id: number;
    comment: string;
    created_at: Date;
  }
  
  @Entity('Review')
  export default class Review implements IReview {
    @PrimaryGeneratedColumn('increment')
    id: number;
  
    @Column()
    user_id: number;
    @Column()
    health_unit_id: number;

    @ManyToOne(() => User, (user: User) => user.reviews, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    @ManyToOne(() => HealthUnit, (healthUnit: HealthUnit) => healthUnit.reviews, {
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'health_unit_id' })
    healthUnit: HealthUnit;
  
    @Column({ type: 'text' })
    comment: string;
  
    @CreateDateColumn()
    created_at: Date;
    
  }
  