import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import HealthUnit from './HealthUnit';

interface IHealthUnitImage {
  id: number;
  image_url: string;
  health_unit_id: number;
}

@Entity('HealthUnitImage')
export default class HealthUnitImage implements IHealthUnitImage {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  image_url: string;

  @ManyToOne(() => HealthUnit, (healthUnit) => healthUnit.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'health_unit_id' })
  healthUnit: HealthUnit;

  @Column()
  health_unit_id: number;
}
