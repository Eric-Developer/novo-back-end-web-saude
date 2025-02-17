import HealthUnit, { HealthUnitType } from '../models/HealthUnit';
import Specialty from '../models/Specialty';
import Address from '../models/Address';
import AppDataSource from '../database/config';
import { Repository, ILike, In, Brackets } from 'typeorm';
import addressService from './addressService';
import CustomError from '../utils/CustomError';
import { PaginationService } from './paginationService';
import { QueryRunner } from 'typeorm/browser';

class HealthUnitService {
  private healthUnitRepository: Repository<HealthUnit>;
  private specialtyRepository: Repository<Specialty>;
  private paginationService: PaginationService<HealthUnit>;

  constructor() {
    this.healthUnitRepository = AppDataSource.getRepository(HealthUnit);
    this.specialtyRepository = AppDataSource.getRepository(Specialty);
    this.paginationService = new PaginationService<HealthUnit>(
      this.healthUnitRepository
    );
  }

  public async newHealthUnit(
    healthUnitData: Partial<HealthUnit>,
    addressData: Partial<Address>,
    image: string,
    userId: number
  ) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const existingHealthUnit = await this.healthUnitRepository.findOne({
        where: { name: healthUnitData.name },
      });

      if (existingHealthUnit) {
        throw new CustomError(
          'Já existe uma unidade de saúde com este nome.',
          409,
          'HEALTH_UNIT_EXISTS'
        );
      }

      const newAddress = await addressService.createAddress(
        addressData,
        queryRunner
      );

      const healthUnit = this.healthUnitRepository.create({
        ...healthUnitData,
        address: newAddress,
        image,
        user_id: userId,
      });

      const newHealthUnit = await queryRunner.manager.save(healthUnit);

      await queryRunner.commitTransaction();
      return newHealthUnit;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        'Erro ao criar unidade de saúde e endereço.',
        500,
        'HEALTH_UNIT_CREATION_FAILED'
      );
    } finally {
      await queryRunner.release();
    }
  }

  public async updateHealthUnit(
    userId: number,
    userRole: string,
    healthUnitId: number,
    updatedHealthUnitData: Partial<HealthUnit>,
    updatedAddressData: Partial<Address>,
    image?: string
  ) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const healthUnit = await this.healthUnitRepository.findOne({
        where: { id: healthUnitId },
        relations: ['address', 'user', 'specialties'],
      });

      if (!healthUnit) {
        throw new CustomError(
          'Unidade de saúde não encontrada.',
          404,
          'HEALTH_UNIT_NOT_FOUND'
        );
      }

      if (userRole !== 'admin' && healthUnit.user_id !== userId) {
        throw new CustomError(
          'Você não tem permissão para atualizar esta unidade de saúde.',
          403,
          'FORBIDDEN'
        );
      }

      healthUnit.image = image || healthUnit.image;

      Object.assign(healthUnit, updatedHealthUnitData);

      if (updatedHealthUnitData.specialties) {
        const specialtyIds = updatedHealthUnitData.specialties.map(
          (specialty) => specialty.id
        );

        const specialties = await this.specialtyRepository.find({
          where: { id: In(specialtyIds) },
        });

        healthUnit.specialties = specialties;
      }

      if (healthUnit.address) {
        Object.assign(healthUnit.address, updatedAddressData);
        await queryRunner.manager.save(healthUnit.address);
      }

      const updatedHealthUnit = await queryRunner.manager.save(healthUnit);

      await queryRunner.commitTransaction();
      return updatedHealthUnit;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        'Erro ao atualizar unidade de saúde e endereço.',
        500,
        'HEALTH_UNIT_UPDATE_FAILED'
      );
    } finally {
      await queryRunner.release();
    }
  }

  public async deleteHealthUnit(
    userId: number,
    userRole: string,
    healthUnitId: number
  ) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const healthUnit = await this.healthUnitRepository.findOne({
        where: { id: healthUnitId },
        relations: ['address', 'user'],
      });

      if (!healthUnit) {
        throw new CustomError(
          'Unidade de saúde não encontrada.',
          404,
          'HEALTH_UNIT_NOT_FOUND'
        );
      }

      if (userRole !== 'admin' && healthUnit.user.id !== userId) {
        throw new CustomError(
          'Você não tem permissão para excluir esta unidade de saúde.',
          403,
          'FORBIDDEN'
        );
      }

      await addressService.deleteAddress(
        Number(healthUnit.address_id),
        queryRunner
      );

      await queryRunner.manager.remove(healthUnit);
      await queryRunner.commitTransaction();
      return { message: 'Unidade de saúde excluída com sucesso.' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        'Erro ao deletar unidade de saúde.',
        500,
        'HEALTH_UNIT_DELETION_FAILED'
      );
    } finally {
      await queryRunner.release();
    }
  }

  public async getAllHealthUnits(
    filters: Record<string, HealthUnit> = {},
    page: number = 1,
    limit: number = 4
  ) {
    return await this.paginationService.findWithPagination(
      filters,
      page,
      limit,
      ['specialties', 'address', 'operating_hours']
    );
  }

  public async getApprovedHealthUnits(
    page?: number,
    filters: Record<string, HealthUnit> = {},
    limit: number = 4,
    showAll: boolean = false
  ) {
    const finalFilters = showAll ? filters : { ...filters, approved: true };
    return await this.paginationService.findWithPagination(
      finalFilters,
      page,
      limit,
      ['specialties', 'address', 'operating_hours']
    );
  }

  public async getUnapprovedHealthUnits(
    filters: Record<string, HealthUnit> = {},
    page: number = 2,
    limit: number = 4
  ) {
    return await this.paginationService.findWithPagination(
      { ...filters, approved: false },
      page,
      limit
    );
  }

  public async countTotalHealthUnits() {
    return await this.healthUnitRepository.count();
  }

  public async searchHealthUnitsByName(
    searchTerm: string,
    page?: number,
    filters: Record<string, HealthUnit> = {},
    limit: number = 4,
    showAll: boolean = false
  ) {
    if (searchTerm.length < 3) {
      throw new CustomError(
        'O termo de pesquisa deve ter pelo menos 3 letras.',
        400,
        'SEARCH_TERM_TOO_SHORT'
      );
    }

    const finalFilters = showAll ? filters : { ...filters, approved: true };

    const result = await this.paginationService.findWithPagination(
      finalFilters,
      page,
      limit,
      ['specialties', 'address', 'operating_hours'],
      (qb) => {
        if (!showAll) {
          qb.andWhere('entity.approved = :approved', { approved: true });
        }

        qb.andWhere(
          new Brackets((subQb) => {
            subQb
              .where('entity.name ILIKE :searchTerm', {
                searchTerm: `%${searchTerm}%`,
              })
              .orWhere('specialties.name ILIKE :searchTerm', {
                searchTerm: `%${searchTerm}%`,
              });
          })
        );
      }
    );

    return result;
  }

  public async getHealthUnitsByUserId(userId: number) {
    const result = await this.healthUnitRepository.find({
      where: { user_id: userId },
      relations: ['address'],
    });

    return {
      data: result,
    };
  }

  public async filterHealthUnitsByType(
    type: string,
    page?: number,
    limit: number = 4,
    showAll: boolean = false
  ) {
    const validType = Object.values(HealthUnitType).find(
      (t) => t.toLowerCase() === type.toLowerCase()
    );

    if (!validType) {
      throw new CustomError(
        'Tipo de unidade de saúde inválido.',
        400,
        'INVALID_HEALTH_UNIT_TYPE'
      );
    }

    const filters: Partial<HealthUnit> = { type: validType as HealthUnitType };
    if (!showAll) {
      filters.approved = true;
    }

    const result = await this.paginationService.findWithPagination(
      filters,
      page,
      limit,
      ['specialties', 'address']
    );

    return result;
  }

  public async getHealthUnitByName(
    fullName: string,
    showAll: boolean,
    userId?: number,
    userType?: string
  ) {
    if (!fullName) {
      throw new CustomError(
        'O nome da unidade de saúde é obrigatório.',
        400,
        'MISSING_NAME'
      );
    }

    const filters: Partial<HealthUnit> = { name: fullName };

    if (userType === 'functional' && userId) {
      const approvedOrOwned = await this.paginationService.findWithPagination(
        {
          name: fullName,
          approved: true,
        },
        1,
        1,
        ['address', 'specialties', 'operating_hours']
      );

      const ownedByUser = await this.paginationService.findWithPagination(
        {
          name: fullName,
          user_id: userId,
        },
        1,
        1,
        ['address', 'specialties', 'operating_hours']
      );

      const combinedResults = [...approvedOrOwned.data, ...ownedByUser.data];

      if (!combinedResults.length) {
        throw new CustomError(
          'Unidade de saúde não encontrada.',
          404,
          'HEALTH_UNIT_NOT_FOUND'
        );
      }

      return combinedResults[0];
    }

    if (!showAll) {
      filters.approved = true;
    }

    const result = await this.paginationService.findWithPagination(
      filters,
      1,
      1,
      ['address', 'specialties', 'operating_hours']
    );

    if (!result.data.length) {
      throw new CustomError(
        'Unidade de saúde não encontrada.',
        404,
        'HEALTH_UNIT_NOT_FOUND'
      );
    }

    return result.data[0];
  }

  public async getHealthUnitsBySpecialty(
    specialtyName: string,
    page?: number,
    limit: number = 4,
    showAll: boolean = false
  ) {
    if (!specialtyName) {
      throw new CustomError(
        'O nome da especialidade é obrigatório.',
        400,
        'MISSING_SPECIALTY_NAME'
      );
    }

    const specialty = await this.specialtyRepository.findOne({
      where: { name: ILike(`%${specialtyName}%`) },
    });

    if (!specialty) {
      throw new CustomError(
        'Especialidade não encontrada.',
        404,
        'SPECIALTY_NOT_FOUND'
      );
    }

    const queryBuilder = this.healthUnitRepository
      .createQueryBuilder('health_unit')
      .leftJoinAndSelect('health_unit.specialties', 'specialty')
      .leftJoinAndSelect('health_unit.address', 'address');

    queryBuilder.andWhere('specialty.id = :specialtyId', {
      specialtyId: specialty.id,
    });

    if (!showAll) {
      queryBuilder.andWhere('health_unit.approved = true');
    }

    queryBuilder.skip((Number(page || 1) - 1) * limit).take(limit);

    const [result, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data: result,
      totalPages,
      page: page || 1,
      limit,
    };
  }

  public async deleteAllHealthUnitsByUser(
    userId: number,
    queryRunner: QueryRunner
  ) {
    const healthUnits = await this.healthUnitRepository.find({
      where: { user_id: userId },
      relations: ['address'],
    });

    if (healthUnits.length === 0) {
      throw new CustomError(
        'Nenhuma unidade de saúde encontrada para o usuário especificado.',
        404,
        'HEALTH_UNITS_NOT_FOUND'
      );
    }

    for (const healthUnit of healthUnits) {
      if (healthUnit.address) {
        await addressService.deleteAddress(
          Number(healthUnit.address.id),
          queryRunner
        );
      }
      await queryRunner.manager.remove(healthUnit);
    }
  }

  public async removeSpecialtiesFromHealthUnit(
    healthUnitId: number,
    specialtyIds: number[]
  ) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const healthUnit = await this.healthUnitRepository.findOne({
        where: { id: healthUnitId },
        relations: ['specialties'],
      });

      if (!healthUnit) {
        throw new CustomError(
          'Unidade de saúde não encontrada.',
          404,
          'HEALTH_UNIT_NOT_FOUND'
        );
      }

      healthUnit.specialties = healthUnit.specialties.filter(
        (specialty) => !specialtyIds.includes(specialty.id)
      );

      await queryRunner.manager.save(healthUnit);
      await queryRunner.commitTransaction();

      return { message: 'Especialidades removidas com sucesso.' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        'Erro ao remover especialidades da unidade de saúde.',
        500,
        'SPECIALTIES_REMOVAL_FAILED'
      );
    } finally {
      await queryRunner.release();
    }
  }

  public async approveHealthUnit(
    userId: number,
    userRole: string,
    healthUnitId: number
  ) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const healthUnit = await this.healthUnitRepository.findOne({
        where: { id: healthUnitId },
        relations: ['user'],
      });

      if (!healthUnit) {
        throw new CustomError(
          'Unidade de saúde não encontrada.',
          404,
          'HEALTH_UNIT_NOT_FOUND'
        );
      }

      if (userRole !== 'admin' && healthUnit.user.id !== userId) {
        throw new CustomError(
          'Você não tem permissão para aprovar esta unidade de saúde.',
          403,
          'FORBIDDEN'
        );
      }

      healthUnit.approved = true;

      const updatedHealthUnit = await queryRunner.manager.save(healthUnit);

      await queryRunner.commitTransaction();

      return updatedHealthUnit;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        'Erro ao aprovar a unidade de saúde.',
        500,
        'HEALTH_UNIT_APPROVAL_FAILED'
      );
    } finally {
      await queryRunner.release();
    }
  }
}

export default new HealthUnitService();
