import { Router, Request, Response } from 'express';
import healthUnitImageService from '../services/healthUnitImageService';
import { uploadMultiple } from '../config/uploadConfig';
import CustomError from '../utils/CustomError';
import verifyToken from '../middlewares/AuthenticatedRequest';
import cloudinaryService from '../services/cloudinaryService';

const healthUnitImageRouter = Router();

// Rota para adicionar imagens à unidade de saúde
healthUnitImageRouter.post(
  '/healthUnit/:healthUnitId/images',
  verifyToken('admin'),
  uploadMultiple,
  async (req: Request, res: Response) => {
    try {
      const healthUnitId = Number(req.params.healthUnitId);
      const imageUrls = req.files
        ? (req.files as Express.Multer.File[]).map((file) => file.path)
        : [];

      const uploadResult = await cloudinaryService.uploadImages(imageUrls);

      if (imageUrls.length === 0) {
        res.status(400).json({ error: 'Nenhuma imagem fornecida.' });
        return;
      }
      const addImagesResult =
        await healthUnitImageService.addImagesToHealthUnit(
          healthUnitId,
          uploadResult
        );
      res.status(200).json(addImagesResult);
    } catch (error) {
      console.error('Erro ao adicionar imagens à unidade de saúde:', error);
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.errorCode,
          details: error.details,
        });
      } else {
        res.status(500).json({
          error:
            error instanceof Error
              ? error.message
              : 'Erro interno ao adicionar imagens à unidade de saúde',
          stack: error instanceof Error ? error.stack : null,
        });
      }
    }
  }
);

// Rota para obter imagens de uma unidade de saúde
healthUnitImageRouter.get(
  '/healthUnit/:healthUnitId/images',
  async (req: Request, res: Response) => {
    try {
      const healthUnitId = Number(req.params.healthUnitId);
      const images =
        await healthUnitImageService.getImagesByHealthUnit(healthUnitId);
      res.status(200).json(images);
    } catch (error) {
      console.error('Erro ao buscar imagens da unidade de saúde:', error);
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.errorCode,
          details: error.details,
        });
      } else {
        res.status(500).json({
          error:
            error instanceof Error
              ? error.message
              : 'Erro interno ao buscar imagens da unidade de saúde',
          stack: error instanceof Error ? error.stack : null,
        });
      }
    }
  }
);

// Rota para deletar imagem de uma unidade de saúde
healthUnitImageRouter.delete(
  '/healthUnit/:healthUnitId/image/:imageId',
  verifyToken('admin'),
  async (req: Request, res: Response) => {
    try {
      const healthUnitId = Number(req.params.healthUnitId);
      const imageId = Number(req.params.imageId);
      await healthUnitImageService.deleteImage(healthUnitId, imageId);
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar imagem da unidade de saúde:', error);
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.errorCode,
          details: error.details,
        });
      } else {
        res.status(500).json({
          error:
            error instanceof Error
              ? error.message
              : 'Erro interno ao deletar imagem da unidade de saúde',
          stack: error instanceof Error ? error.stack : null,
        });
      }
    }
  }
);

export default healthUnitImageRouter;
