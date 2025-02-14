import { Router, Request, Response } from 'express';
import favoritesService from '../services/favoritesService';
import { validateFields } from '../validators/validateFields';
import CustomError from '../utils/CustomError';
import { UserRequest } from '../types/UserRequest';
import verifyToken from '../middlewares/AuthenticatedRequest';

const favoriteRouter = Router();

// Rota para listar os favoritos do usuário
favoriteRouter.get('/favorites', verifyToken(), async (req: UserRequest, res: Response) => {
  try {
    const favorites = await favoritesService.getFavoritesByUser(Number(req.userId));
    res.status(200).json(favorites);
  } catch (error) {
    console.error('Erro ao listar favoritos:', error);
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({
        error: error.message,
        code: error.errorCode,
        details: error.details,
      });
    } else {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro interno ao listar favoritos',
        stack: error instanceof Error ? error.stack : null,
      });
    }
  }
});

// Rota para adicionar um favorito
favoriteRouter.post('/favorite', verifyToken(), async (req: UserRequest, res: Response) => {
  try {
   
    const favorite = await favoritesService.createFavorite(Number(req.userId), req.body.health_unit_id);
    res.status(201).json(favorite);
  } catch (error) {
    console.error('Erro ao adicionar favorito:', error);
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({
        error: error.message,
        code: error.errorCode,
        details: error.details,
      });
    } else {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro interno ao adicionar favorito',
        stack: error instanceof Error ? error.stack : null,
      });
    }
  }
});

// Rota para remover um favorito
favoriteRouter.delete('/favorite/:id', verifyToken(), async (req: UserRequest, res: Response) => {
  try {
    await favoritesService.deleteFavorite(Number(req.userId), Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({
        error: error.message,
        code: error.errorCode,
        details: error.details,
      });
    } else {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro interno ao remover favorito',
        stack: error instanceof Error ? error.stack : null,
      });
    }
  }
});

// Rota para obter um favorito específico de uma unidade de saúde
favoriteRouter.get('/favorite/:healthUnitId', verifyToken(), async (req: UserRequest, res: Response) => {
  try {
    const favorite = await favoritesService.getFavoriteByHealthUnit(Number(req.userId), Number(req.params.healthUnitId));
    res.status(200).json(favorite);
  } catch (error) {
    console.error('Erro ao buscar favorito:', error);
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({
        error: error.message,
        code: error.errorCode,
        details: error.details,
      });
    } else {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro interno ao buscar favorito',
        stack: error instanceof Error ? error.stack : null,
      });
    }
  }
});

export default favoriteRouter;
