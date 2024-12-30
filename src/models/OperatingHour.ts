import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import HealthUnit from "./HealthUnit";

interface IOperatingHour {
    id: number;
    day_of_week: string;
    open_time: string;
    close_time: string;
    health_unit_id: number; 
}

@Entity('OperatingHour')
export default class OperatingHour implements IOperatingHour {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    day_of_week: string;

    @Column()
    open_time: string;

    @Column()
    close_time: string; 

    @Column()
    health_unit_id: number;

    @ManyToOne(() => HealthUnit, (healthUnit) => healthUnit.id)
    @JoinColumn({ name: 'health_unit_id' })
    health_unit: HealthUnit;
}
