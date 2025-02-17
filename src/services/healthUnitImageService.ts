import { Repository } from 'typeorm';
import HealthUnitImage from '../models/HealthUnitImage';
import HealthUnit from '../models/HealthUnit';
import AppDataSource from '../database/config';
import CustomError from '../utils/CustomError';

class HealthUnitImageService {
  private healthUnitImageRepository: Repository<HealthUnitImage>;
  private healthUnitRepository: Repository<HealthUnit>;

  constructor() {
    this.healthUnitImageRepository =
      AppDataSource.getRepository(HealthUnitImage);
    this.healthUnitRepository = AppDataSource.getRepository(HealthUnit);
  }

  public async addImagesToHealthUnit(
    healthUnitId: number,
    images: string[]
  ): Promise<HealthUnitImage[]> {
    try {
      const healthUnit = await this.healthUnitRepository.findOne({
        where: { id: healthUnitId },
      });

      if (!healthUnit) {
        throw new CustomError(
          'Unidade de saúde não encontrada.',
          404,
          'HEALTH_UNIT_NOT_FOUND'
        );
      }

      // Cria objetos de imagem para cada URL de imagem
      const healthUnitImages = images.map((image) => {
        const healthUnitImage = this.healthUnitImageRepository.create({
          image_url: image,
          healthUnit,
        });
        return healthUnitImage;
      });

      return await this.healthUnitImageRepository.save(healthUnitImages);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        `Erro ao adicionar imagens: ${error instanceof Error ? error.message : String(error)}`,
        500,
        'HEALTH_UNIT_IMAGE_ADD_FAILED'
      );
    }
  }

  public async getImagesByHealthUnit(
    healthUnitId: number
  ): Promise<HealthUnitImage[]> {
    try {
      const healthUnit = await this.healthUnitRepository.findOne({
        where: { id: healthUnitId },
      });

      if (!healthUnit) {
        throw new CustomError(
          'Unidade de saúde não encontrada.',
          404,
          'HEALTH_UNIT_NOT_FOUND'
        );
      }

      return await this.healthUnitImageRepository.find({
        where: { health_unit_id: healthUnitId },
      });
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        `Erro ao buscar imagens: ${error instanceof Error ? error.message : String(error)}`,
        500,
        'HEALTH_UNIT_IMAGE_FETCH_FAILED'
      );
    }
  }

  public async deleteImage(
    healthUnitId: number,
    imageId: number
  ): Promise<void> {
    try {
      const image = await this.healthUnitImageRepository.findOne({
        where: { id: imageId, health_unit_id: healthUnitId },
      });

      if (!image) {
        throw new CustomError(
          'Imagem não encontrada ou não pertence à unidade de saúde.',
          404,
          'IMAGE_NOT_FOUND'
        );
      }

      await this.healthUnitImageRepository.remove(image);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        `Erro ao remover imagem: ${error instanceof Error ? error.message : String(error)}`,
        500,
        'HEALTH_UNIT_IMAGE_DELETION_FAILED'
      );
    }
  }
}

export default new HealthUnitImageService();
