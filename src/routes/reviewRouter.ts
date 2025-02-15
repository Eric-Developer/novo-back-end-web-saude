import { Router, Request, Response } from 'express';
import reviewService from '../services/ReviewService';
import { validateFields } from '../validators/validateFields';
import CustomError from '../utils/CustomError';
import { UserRequest } from '../types/UserRequest';
import verifyToken from '../middlewares/AuthenticatedRequest';

const reviewRouter = Router();

// Rota para listar avaliações de uma unidade de saúde
reviewRouter.get('/reviews/:healthUnitId', verifyToken(), async (req: Request, res: Response) => {
  try {
    const reviews = await reviewService.getReviewsByHealthUnit(Number(req.params.healthUnitId));
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Erro ao listar avaliações:', error);
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({
        error: error.message,
        code: error.errorCode,
        details: error.details,
      });
    } else {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro interno ao listar avaliações',
        stack: error instanceof Error ? error.stack : null,
      });
    }
  }
});

// Rota para adicionar uma avaliação
reviewRouter.post('/review', verifyToken(), async (req: UserRequest, res: Response) => {
  try {
    const { health_unit_id, comment } = req.body;
    
    const review = await reviewService.createReview(Number(req.userId), health_unit_id, comment);
    res.status(201).json(review);
  } catch (error) {
    console.error('Erro ao adicionar avaliação:', error);
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({
        error: error.message,
        code: error.errorCode,
        details: error.details,
      });
    } else {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro interno ao adicionar avaliação',
        stack: error instanceof Error ? error.stack : null,
      });
    }
  }
});

// Rota para remover uma avaliação
reviewRouter.delete('/review/:id', verifyToken(), async (req: UserRequest, res: Response) => {
  try {
    await reviewService.deleteReview(Number(req.userId), Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao remover avaliação:', error);
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({
        error: error.message,
        code: error.errorCode,
        details: error.details,
      });
    } else {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro interno ao remover avaliação',
        stack: error instanceof Error ? error.stack : null,
      });
    }
  }
});

export default reviewRouter;
