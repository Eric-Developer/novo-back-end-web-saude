import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import HealthUnit from './HealthUnit';

export enum Day {
  Sunday = 'sunday',
  Monday = 'monday',
  Tuesday = 'tuesday',
  Wednesday = 'wednesday',
  Thursday = 'thursday',
  Friday = 'friday',
  Saturday = 'saturday',
}

interface IOperatingHours {
  id: number;
  day_of_week: Day;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
  health_unit_id: number;
}

@Entity('OperatingHours')
export default class OperatingHours implements IOperatingHours {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    type: 'enum',
    enum: Day,
  })
  day_of_week: Day;

  @Column({ type: 'time', nullable: true })
  open_time: string | null;

  @Column({ type: 'time', nullable: true })
  close_time: string | null;

  @Column({ type: 'boolean', default: false })
  is_closed: boolean;

  @Column()
  health_unit_id: number;

  @ManyToOne(() => HealthUnit, (healthUnit) => healthUnit.id)
  @JoinColumn({ name: 'health_unit_id' })
  health_unit: HealthUnit;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
