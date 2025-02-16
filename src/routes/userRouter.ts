import { Router, Request, Response } from 'express';
import userService from '../services/userService';
import { validateFields } from '../validators/validateFields';
import cloudinaryService from '../services/cloudinaryService';
import upload from '../config/uploadConfig';
import path from 'path';
import fs from 'fs';
import CustomError from '../utils/CustomError';
import { UserRequest } from '../types/UserRequest';
import verifyToken from '../middlewares/AuthenticatedRequest';

const userRouter = Router();

// Route para listar os usuários
userRouter.get(
  '/users',
  verifyToken('admin'),
  async (req: Request, res: Response) => {
    try {
      const users = await userService.fetchAllUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
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
              : 'Erro interno ao listar usuários',
          stack: error instanceof Error ? error.stack : null,
        });
      }
    }
  }
);

// Rota para listar um único usuário
userRouter.get(
  '/user/',
  verifyToken(),
  async (req: UserRequest, res: Response) => {
    try {
      const user = await userService.fetchUserById(Number(req.userId));
      if (!user) {
        throw new CustomError('Usuário não encontrado.', 404, 'USER_NOT_FOUND');
      }
      res.status(200).json(user);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.errorCode,
          details: error.details,
        });
      } else {
        res.status(500).json({
          error:
            error instanceof Error ? error.message : 'Erro ao buscar usuário',
          stack: error instanceof Error ? error.stack : null,
        });
      }
    }
  }
);

// Rota para alterar informações do usuário
userRouter.put(
  '/user/',
  verifyToken(), upload.single('image'),

  async (req: UserRequest, res: Response) => {
    try {
      const updateValidationRules = [
        { field: 'name', required: true },
        { field: 'phone', required: true },
      ];

       if (!req.file) {
              res.status(400).json({ error: 'Arquivo de imagem não encontrado' });
              return;
            }
      
      const filePath = path.resolve(req.file.path);
      
      const uploadResult = await cloudinaryService.uploadImage(filePath);

      req.body.image = uploadResult
      const errors = validateFields(req.body, updateValidationRules);

      if (errors.length) {
        res.status(400).json({ errors });
        return;
      }

      const updatedUser = await userService.modifyUser(
        Number(req.userId),
        req.body
      );
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
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
              : 'Erro interno ao atualizar o usuário',
          stack: error instanceof Error ? error.stack : null,
        });
      }
    }
  }
);

// Rota para deletar usuário
userRouter.delete(
  '/user/',
  verifyToken(),
  async (req: UserRequest, res: Response) => {
    try {
      await userService.deleteUser(Number(req.userId));
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
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
              : 'Erro interno ao deletar o usuário',
          stack: error instanceof Error ? error.stack : null,
        });
      }
    }
  }
);

// Rota para alterar imagem do usuário
userRouter.patch(
  '/update/user/image',
  upload.single('image'),
  verifyToken(),
  async (req: UserRequest, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'Arquivo de imagem não encontrado' });
        return;
      }

      const filePath = path.resolve(req.file.path);

      const uploadResult = await cloudinaryService.uploadImage(filePath);
      const updatedUser = await userService.changeUserImage(
        Number(req.userId),
        uploadResult
      );

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Erro ao excluir o arquivo local:', err);
        } else {
          console.log('Arquivo local excluído com sucesso');
        }
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Erro ao atualizar imagem do usuário:', error);
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
              : 'Erro interno ao atualizar a imagem do usuário',
          stack: error instanceof Error ? error.stack : null,
        });
      }
    }
  }
);

// Rota para obter o total de usuários
userRouter.get('/users/total', async (req: Request, res: Response) => {
  try {
    const totalUsers = await userService.getTotalUsers();
    res.status(200).json({ total: totalUsers });
  } catch (error) {
    console.error('Erro ao obter total de usuários:', error);
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
            : 'Erro interno ao obter o total de usuários',
        stack: error instanceof Error ? error.stack : null,
      });
    }
  }
});

export default userRouter;
