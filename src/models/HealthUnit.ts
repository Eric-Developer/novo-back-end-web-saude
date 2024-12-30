import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn,
 ManyToMany, JoinTable } from "typeorm";
import User from "./User";
import Address from "./Address";
import Specialty from "./Specialty";

export enum HealthUnitType {
    Clinic = "clinic",
    Hospital = "hospital", 
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
    
}

@Entity('HealthUnit')
export default class HealthUnit implements IHealthUnit {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    image: string;

    @Column({ unique: true })
    email: string;

    @Column({
        type: "enum",
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

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Address)
    @JoinColumn({ name: 'address_id' })
    address: Address;
    
    @ManyToMany(() => Specialty)
    @JoinTable() 
    specialties: Specialty[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
