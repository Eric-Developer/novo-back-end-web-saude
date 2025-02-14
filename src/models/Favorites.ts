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
  
  export interface IFavorite {
    id: number;
    is_favorite: boolean;
    user_id: number;
    health_unit_id: number;
    user: User;
    healthUnit: HealthUnit;
    created_at: Date;
  }

  @Entity('Favorites')
  export default class Favorite implements IFavorite {
    @PrimaryGeneratedColumn('increment')
    id: number;
  
    @Column({ default: false })
    is_favorite: boolean;

    @Column()
    user_id: number;
  
    @Column()
    health_unit_id: number;
  
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    @ManyToOne(() => HealthUnit, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'health_unit_id' })
    healthUnit: HealthUnit;
  
    @CreateDateColumn()
    created_at: Date;
  }
  