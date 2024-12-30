import HealthUnit, { HealthUnitType } from "../models/HealthUnit";
import Specialty from "../models/Specialty"; 
import Address from "../models/Address";
import AppDataSource from "../database/config";
import { Repository, ILike } from "typeorm";
import addressService from "./addressService";
import CustomError from "../utils/CustomError";

class HealthUnitService {
    private healthUnitRepository: Repository<HealthUnit>;
    private specialtyRepository: Repository<Specialty>; 

    constructor() {
        this.healthUnitRepository = AppDataSource.getRepository(HealthUnit);
        this.specialtyRepository = AppDataSource.getRepository(Specialty);  
    }

    public async newHealthUnit(
        healthUnitData: Partial<HealthUnit>, 
        addressData: Partial<Address>,
        specialtyIds: number[],
        image:string,
        userId:number
    ) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.startTransaction();

        try {
            const existingHealthUnit = await this.healthUnitRepository.findOne({
                where: { name: healthUnitData.name },
            });

            if (existingHealthUnit) {
                throw new CustomError(
                    "Já existe uma unidade de saúde com este nome.", 
                    409, 
                    "HEALTH_UNIT_EXISTS"
                );
            }

            const newAddress = await addressService.createAddress(addressData, queryRunner);

            const specialties = await this.specialtyRepository.findByIds(specialtyIds);

            if (specialties.length !== specialtyIds.length) {
                throw new CustomError(
                    "Uma ou mais especialidades não foram encontradas.", 
                    404, 
                    "SPECIALTIES_NOT_FOUND"
                );
            }

            const healthUnit = this.healthUnitRepository.create({
                ...healthUnitData,
                address: newAddress,
                specialties,
                image,
                user_id:userId
            });

            const newHealthUnit = await queryRunner.manager.save(healthUnit);

            await queryRunner.commitTransaction();
            return newHealthUnit;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof CustomError) throw error;
            throw new CustomError(
                "Erro ao criar unidade de saúde e endereço.", 
                500, 
                "HEALTH_UNIT_CREATION_FAILED"
            );
        } finally {
            await queryRunner.release(); 
        }
    }

    public async updateHealthUnit(
        userId: number, 
        userRole: string,
        id: number, 
        updatedHealthUnitData: Partial<HealthUnit>, 
        updatedAddressData: Partial<Address>
    ) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.startTransaction();
    
        try {
            const healthUnit = await this.healthUnitRepository.findOne({
                where: { id },
                relations: ['address', 'user'],
            });
    
            if (!healthUnit) {
                throw new CustomError("Unidade de saúde não encontrada.", 404, "HEALTH_UNIT_NOT_FOUND");
            }
    
            if (userRole !== 'admin' && healthUnit.user_id !== userId) {
                throw new CustomError("Você não tem permissão para atualizar esta unidade de saúde.", 403, "FORBIDDEN");
            }
    
            Object.assign(healthUnit, {
                ...healthUnit,
                ...updatedHealthUnitData,
            });
    
            if (healthUnit.address) {
                Object.assign(healthUnit.address, {
                    ...healthUnit.address,
                    ...updatedAddressData,
                });
                await queryRunner.manager.save(healthUnit.address);
            }
    
            const updatedHealthUnit = await queryRunner.manager.save(healthUnit);
    
            await queryRunner.commitTransaction();
            return updatedHealthUnit;
    
        } catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof CustomError) throw error;
            throw new CustomError(
                "Erro ao atualizar unidade de saúde e endereço.", 
                500, 
                "HEALTH_UNIT_UPDATE_FAILED"
            );
        } finally {
            await queryRunner.release();
        }
    }
    
    public async deleteHealthUnit(userId: number, userRole: string, id: number) {
        try {
            const healthUnit = await this.healthUnitRepository.findOne({
                where: { id },
                relations: ['user'],
            });
    
            if (!healthUnit) {
                throw new CustomError("Unidade de saúde não encontrada.", 404, "HEALTH_UNIT_NOT_FOUND");
            }
    
            if (userRole !== 'admin' && healthUnit.user.id !== userId) {
                throw new CustomError("Você não tem permissão para excluir esta unidade de saúde.", 403, "FORBIDDEN");
            }
    
            return await this.healthUnitRepository.remove(healthUnit);
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("Erro ao deletar unidade de saúde.", 500, "HEALTH_UNIT_DELETION_FAILED");
        }
    }
    
    public async getAllHealthUnits() {
        return await this.healthUnitRepository.find({
            relations: ['address'],
        });
    }

    public async getApprovedHealthUnits() {
        return await this.healthUnitRepository.find({
            where: { approved: true },
            relations: ['address'],
        });
    }

    public async getUnapprovedHealthUnits() {
        return await this.healthUnitRepository.find({
            where: { approved: false },
            relations: ['address'],
        });
    }

    public async countTotalHealthUnits() {
        return await this.healthUnitRepository.count();
    }

    public async searchHealthUnitsByName(searchTerm: string) {
        if (searchTerm.length < 3) {
            throw new CustomError(
                "O termo de pesquisa deve ter pelo menos 3 letras.", 
                400, 
                "SEARCH_TERM_TOO_SHORT"
            );
        }
    
        return await this.healthUnitRepository.find({
            where: [
                { name: ILike(`%${searchTerm}%`), approved: true },
                { specialties: { name: ILike(`%${searchTerm}%`) }, approved: true }
            ],
            relations: ['address', 'specialties'],
        });
    }
    
    public async getHealthUnitsByUserId(userId: number) {
        return await this.healthUnitRepository.find({
            where: { user_id: userId },
            relations: ['address'],
        });
    }

    public async filterHealthUnitsByType(type: string) {
        const validType = Object.values(HealthUnitType).find(
            (t) => t.toLowerCase() === type.toLowerCase()
        );
    
        if (!validType) {
            throw new CustomError(
                "Tipo de unidade de saúde inválido.",
                400, 
                "INVALID_HEALTH_UNIT_TYPE"
            );
        }
    
        return await this.healthUnitRepository.find({
            where: {
                type: validType,
                approved: true, 
            },
            relations: ['address'],
        });
    }
    
    public async getHealthUnitByName(fullName: string) {
        if (!fullName) {
            throw new CustomError(
                "O nome da unidade de saúde é obrigatório.", 
                400, 
                "MISSING_NAME"
            );
        }
    
        const healthUnit = await this.healthUnitRepository.findOne({
            where: { name: fullName, approved: true },
            relations: ['address', 'specialties'],
        });
          
        if (!healthUnit) {
            throw new CustomError(
                "Unidade de saúde não encontrada.", 
                404, 
                "HEALTH_UNIT_NOT_FOUND"
            );
        }
    
        return healthUnit;
    }
    
    public async getHealthUnitsBySpecialty(specialtyName: string) {
        if (!specialtyName) {
            throw new CustomError(
                "O nome da especialidade é obrigatório.",
                400,
                "MISSING_SPECIALTY_NAME"
            );
        }
    
        const specialty = await this.specialtyRepository.findOne({
            where: { name: ILike(`%${specialtyName}%`) },
        });
    
        if (!specialty) {
            throw new CustomError(
                "Especialidade não encontrada.",
                404,
                "SPECIALTY_NOT_FOUND"
            );
        }
    
        return await this.healthUnitRepository.find({
            where: {
                specialties: { id: specialty.id },
                approved: true, 
            },
            relations: ['address', 'specialties'],
        });
    }
    
}

export default new HealthUnitService();
