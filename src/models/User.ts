import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany } from "typeorm"
import HealthUnit from "./HealthUnit";

enum UserType {
    Common = "common",  
    Functional = "functional",
    Admin = "admin"
}

interface IUser {
    id: number
    name: string
    email: string
    password: string
    phone: string
    user_type: UserType  
    image: string
    is_active: boolean
}

@Entity('User')
export default class User implements IUser {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string
    
    @Column({ unique: true })
    email: string
    
    @Column()
    password: string
    
    @Column()
    phone: string

    @Column({
        type: "enum",
        enum: UserType,        
        default: UserType.Admin
    })
    user_type: UserType

    @Column({ type: 'text', nullable: true })
    image: string

    @Column({ default: true })
    is_active: boolean

    @OneToMany(() => HealthUnit, (healthUnit) => healthUnit.user, { cascade: true })
    healthUnits: HealthUnit[];

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}
