import { Column, Entity, PrimaryGeneratedColumn, ManyToMany } from "typeorm";
import HealthUnit from "./HealthUnit";
interface ISpecialty {
    id: number;
    name: string;
}

@Entity('Specialties')
export default class Specialty implements ISpecialty {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string;
    @ManyToMany(() => HealthUnit, healthUnit => healthUnit.specialties)
    healthUnits: HealthUnit[];

}
