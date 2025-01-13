import Specialty from '../models/Specialty';
import AppDataSource from '../database/config';
import { Repository, ILike } from 'typeorm';
import CustomError from '../utils/CustomError';

class SpecialtyService {
  private specialtyRepository: Repository<Specialty>;

  constructor() {
    this.specialtyRepository = AppDataSource.getRepository(Specialty);
  }

  // Criar uma nova especialidade
  public async createSpecialty(specialtyData: Partial<Specialty>) {
    if (!specialtyData.name) {
      throw new CustomError(
        'O nome da especialidade é obrigatório.',
        400,
        'SPECIALTY_NAME_REQUIRED'
      );
    }

    // Verificar se já existe uma especialidade com o mesmo nome (ignorando maiúsculas e minúsculas)
    const existingSpecialty = await this.specialtyRepository.findOne({
      where: {
        name: ILike(specialtyData.name), // Ignorando caixa de caracteres
      },
    });

    if (existingSpecialty) {
      throw new CustomError(
        'Já existe uma especialidade com esse nome.',
        409,
        'SPECIALTY_ALREADY_EXISTS'
      );
    }

    const specialty = this.specialtyRepository.create(specialtyData);
    return await this.specialtyRepository.save(specialty);
  }

  // Atualizar uma especialidade
  public async updateSpecialty(
    id: number,
    updatedSpecialtyData: Partial<Specialty>
  ) {
    const specialty = await this.specialtyRepository.findOne({ where: { id } });
    if (!specialty) {
      throw new CustomError(
        'Especialidade não encontrada',
        404,
        'SPECIALTY_NOT_FOUND'
      );
    }

    // Se o nome da especialidade for alterado, verificar se o novo nome já existe
    if (
      updatedSpecialtyData.name &&
      updatedSpecialtyData.name !== specialty.name
    ) {
      const existingSpecialty = await this.specialtyRepository.findOne({
        where: {
          name: ILike(updatedSpecialtyData.name), // Ignorando caixa de caracteres
        },
      });

      if (existingSpecialty) {
        throw new CustomError(
          'Já existe uma especialidade com esse nome.',
          409,
          'SPECIALTY_ALREADY_EXISTS'
        );
      }
    }

    Object.assign(specialty, updatedSpecialtyData);
    return await this.specialtyRepository.save(specialty);
  }

  // Deletar uma especialidade
  public async deleteSpecialty(id: number) {
    const specialty = await this.specialtyRepository.findOne({ where: { id } });
    if (!specialty)
      throw new CustomError(
        'Especialidade não encontrada',
        404,
        'SPECIALTY_NOT_FOUND'
      );

    return await this.specialtyRepository.remove(specialty);
  }

  // Listar todas as especialidades
  public async getAllSpecialties() {
    return await this.specialtyRepository.find();
  }

  // Buscar especialidades por nome
  public async searchSpecialtiesByName(searchTerm: string) {
    if (searchTerm.length < 3) {
      throw new CustomError(
        'O termo de pesquisa deve ter pelo menos 3 letras.',
        400,
        'SEARCH_TERM_TOO_SHORT'
      );
    }

    return await this.specialtyRepository.find({
      where: {
        name: ILike(`%${searchTerm}%`),
      },
    });
  }
}

export default new SpecialtyService();
