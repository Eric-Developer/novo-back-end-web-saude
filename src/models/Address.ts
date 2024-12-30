import { Column, Entity, PrimaryGeneratedColumn,CreateDateColumn,UpdateDateColumn } from "typeorm";

interface IAddress {
    id: number;
    zip_code: string;
    state: string;
    city: string;
    neighborhood: string;
    street: string;
    number: string;
}

@Entity('Address')
export default class Address implements IAddress {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    zip_code: string;

    @Column()
    state: string;

    @Column()
    city: string;

    @Column()
    neighborhood: string;

    @Column()
    street: string;

    @Column()
    number: string;

    @CreateDateColumn()
    created_at: Date;
    
    @UpdateDateColumn()
    updated_at: Date;
}
