import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum PendingUserStatus {
    PENDING = 'pending',
    VERIFIED = 'verified',
}

interface IPendingUser {
    id: number;
    name: string;
    email: string;
    password: string;
    phone: string;
    status: PendingUserStatus;
}

@Entity('PendingUser')
export default class PendingUser implements IPendingUser {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    phone: string;

    @Column({ type: 'enum', enum: PendingUserStatus, default: PendingUserStatus.PENDING })
    status: PendingUserStatus;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
