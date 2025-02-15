import { Repository } from 'typeorm';
import Review from '../models/Review';
import User from '../models/User';
import HealthUnit from '../models/HealthUnit';
import AppDataSource from '../database/config';
import CustomError from '../utils/CustomError';

class ReviewService {
  private reviewRepository: Repository<Review>;
  private userRepository: Repository<User>;
  private healthUnitRepository: Repository<HealthUnit>;

  constructor() {
    this.reviewRepository = AppDataSource.getRepository(Review);
    this.userRepository = AppDataSource.getRepository(User);
    this.healthUnitRepository = AppDataSource.getRepository(HealthUnit);
  }

  public async createReview(userId: number, healthUnitId: number, rating: number, comment: string): Promise<Review> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      const healthUnit = await this.healthUnitRepository.findOne({ where: { id: healthUnitId } });

      if (!user) {
        throw new CustomError('Usuário não encontrado.', 404, 'USER_NOT_FOUND');
      }

      if (!healthUnit) {
        throw new CustomError('Unidade de saúde não encontrada.', 404, 'HEALTH_UNIT_NOT_FOUND');
      }

      const review = this.reviewRepository.create({
        user_id: userId,
        health_unit_id: healthUnitId,
        rating,
        comment,
        user,
        healthUnit,
      });

      return await this.reviewRepository.save(review);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        `Erro ao criar avaliação: ${error instanceof Error ? error.message : String(error)}`,
        500,
        'REVIEW_CREATION_FAILED'
      );
    }
  }

  public async getReviewsByHealthUnit(healthUnitId: number): Promise<Review[]> {
    try {
      return await this.reviewRepository.find({
        where: { health_unit_id: healthUnitId },
        relations: ['user', 'healthUnit'],
      });
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        `Erro ao buscar avaliações: ${error instanceof Error ? error.message : String(error)}`,
        500,
        'REVIEW_FETCH_FAILED'
      );
    }
  }

  public async deleteReview(userId: number, reviewId: number): Promise<void> {
    try {
      const review = await this.reviewRepository.findOne({ where: { id: reviewId, user_id: userId } });

      if (!review) {
        throw new CustomError('Avaliação não encontrada ou não pertence ao usuário.', 404, 'REVIEW_NOT_FOUND');
      }

      await this.reviewRepository.remove(review);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        `Erro ao remover avaliação: ${error instanceof Error ? error.message : String(error)}`,
        500,
        'REVIEW_DELETION_FAILED'
      );
    }
  }
}

export default new ReviewService();
