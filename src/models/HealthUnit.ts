import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToOne,
} from 'typeorm';
import User from './User';
import Address from './Address';
import Specialty from './Specialty';
import OperatingHours from './OperatingHours';
import Exam from './Exam';

export enum HealthUnitType {
  Clinic = 'clinic',
  Hospital = 'hospital',
}
interface IHealthUnit {
  id: number;
  name: string;
  image: string;
  email: string;
  type: HealthUnitType;
  whatsapp: string;
  description: string;
  longitude: string;
  latitude: string;
  approved: boolean;
  status: boolean;
  user_id: number;
  address_id: number;
  specialties: Specialty[];
  exams: Exam[];
  operating_hours: OperatingHours[];
}

@Entity('HealthUnit')
export default class HealthUnit implements IHealthUnit {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  image: string;

  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: HealthUnitType,
    default: HealthUnitType.Clinic,
  })
  type: HealthUnitType;

  @Column()
  whatsapp: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  longitude: string;

  @Column()
  latitude: string;

  @Column({ default: false })
  approved: boolean;

  @Column({ default: true })
  status: boolean;

  @Column()
  user_id: number;

  @Column()
  address_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => Address, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @ManyToMany(() => Specialty)
  @JoinTable()
  specialties: Specialty[];

  @ManyToMany(() => Specialty)
  @JoinTable()
  exams: Exam[];

  @OneToMany(
    () => OperatingHours,
    (operatingHours: OperatingHours) => operatingHours.health_unit,
    { cascade: true }
  )
  operating_hours: OperatingHours[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
