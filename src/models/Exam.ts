import { Column, Entity, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import HealthUnit from './HealthUnit';
interface IExam {
  id: number;
  name: string;
}

@Entity('Exams')
export default class Exam implements IExam {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;
  @ManyToMany(() => HealthUnit, (healthUnit) => healthUnit.specialties)
  healthUnits: HealthUnit[];
}
