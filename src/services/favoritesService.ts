import { Repository } from 'typeorm';
import Favorite from '../models/Favorites';
import User from '../models/User';
import HealthUnit from '../models/HealthUnit';
import AppDataSource from '../database/config';
import CustomError from '../utils/CustomError';

 class FavoriteService {
  private favoriteRepository: Repository<Favorite>;
  private userRepository: Repository<User>;
  private healthUnitRepository: Repository<HealthUnit>;

  constructor() {
    this.favoriteRepository = AppDataSource.getRepository(Favorite);
    this.userRepository = AppDataSource.getRepository(User);
    this.healthUnitRepository = AppDataSource.getRepository(HealthUnit);
  }

  public async createFavorite(userId: number, healthUnitId: number): Promise<Favorite> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      const healthUnit = await this.healthUnitRepository.findOne({ where: { id: healthUnitId } });
  
      if (!user) {
        throw new CustomError('Usuário não encontrado.', 404, 'USER_NOT_FOUND');
      }
  
      if (!healthUnit) {
        throw new CustomError('Unidade de saúde não encontrada.', 404, 'HEALTH_UNIT_NOT_FOUND');
      }
  
      // Verificar se o favorito já existe
      const existingFavorite = await this.favoriteRepository.findOne({
        where: { user_id: userId, health_unit_id: healthUnitId },
      });
  
      if (existingFavorite) {
        throw new CustomError('Este favorito já foi adicionado.', 400, 'FAVORITE_ALREADY_EXISTS');
      }
  
      const favorite = this.favoriteRepository.create({
        user_id: userId,
        is_favorite: true,
        health_unit_id: healthUnitId,
        user,
        healthUnit,
      });
  
      return await this.favoriteRepository.save(favorite);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        `Erro ao criar favorito: ${error instanceof Error ? error.message : String(error)}`,
        500,
        'FAVORITE_CREATION_FAILED'
      );
    }
  }
  
  public async getFavoritesByUser(userId: number): Promise<HealthUnit[]> {
    try {
      const favorites = await this.healthUnitRepository.find({
        where: { user_id: userId },
        relations: ['user', 'favorites', 'address' ],
      });

      return favorites;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        `Erro ao buscar favoritos: ${error instanceof Error ? error.message : String(error)}`,
        500,
        'FAVORITE_FETCH_FAILED'
      );
    }
  }

  public async deleteFavorite(userId: number, healthUnitId: number): Promise<void> {
    try {
      const favorite = await this.favoriteRepository.findOne({
        where: { user_id: userId, health_unit_id: healthUnitId },
      });

      if (!favorite) {
        throw new CustomError('Favorito não encontrado.', 404, 'FAVORITE_NOT_FOUND');
      }

      await this.favoriteRepository.remove(favorite);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        `Erro ao remover favorito: ${error instanceof Error ? error.message : String(error)}`,
        500,
        'FAVORITE_DELETION_FAILED'
      );
    }
  }

  public async getFavoriteByHealthUnit(userId: number, healthUnitId: number): Promise<Favorite | null> {
    try {
      const favorite = await this.favoriteRepository.findOne({
        where: { user_id: userId, health_unit_id: healthUnitId },
        relations: ['user', 'healthUnit'],
      });
  
      if (!favorite) {
        throw new CustomError('Favorito não encontrado.', 404, 'FAVORITE_NOT_FOUND');
      }
  
      return favorite;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        `Erro ao buscar favorito: ${error instanceof Error ? error.message : String(error)}`,
        500,
        'FAVORITE_FETCH_FAILED'
      );
    }
  }
  
}

export default new FavoriteService()