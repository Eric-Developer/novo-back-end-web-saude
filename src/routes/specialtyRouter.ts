import { Router, Request, Response } from 'express';
import specialtyService from '../services/specialtyService';
import { validateFields } from '../validators/validateFields';
import CustomError from '../utils/CustomError';

const specialtyRouter = Router();

// Criar uma nova especialidade
specialtyRouter.post('/specialty', async (req: Request, res: Response) => {
  const { name } = req.body;

  try {
    const createValidationRules = [{ field: 'name', required: true }];

    const errors = validateFields(req.body, createValidationRules);

    if (errors.length) {
      res.status(400).json({ errors });
      return;
    }

    const newSpecialty = await specialtyService.createSpecialty({ name });
    res.status(201).json(newSpecialty);
  } catch (error) {
    console.error('Erro ao criar especialidade:', error);
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
            : 'Erro interno ao criar especialidade',
        stack: error instanceof Error ? error.stack : null,
      });
    }
  }
});

// Atualizar uma especialidade
specialtyRouter.put('/specialty/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updateValidationRules = [{ field: 'name', required: false }];

    const errors = validateFields(req.body, updateValidationRules);

    if (errors.length) {
      res.status(400).json({ errors });
      return;
    }

    const updatedSpecialty = await specialtyService.updateSpecialty(
      Number(id),
      { name }
    );
    res.status(200).json(updatedSpecialty);
  } catch (error) {
    console.error('Erro ao atualizar especialidade:', error);
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
            : 'Erro interno ao atualizar especialidade',
        stack: error instanceof Error ? error.stack : null,
      });
    }
  }
});

// Deletar uma especialidade
specialtyRouter.delete(
  '/specialty/:id',
  async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await specialtyService.deleteSpecialty(Number(id));
      res.status(204).send();
      return;
    } catch (error) {
      console.error('Erro ao deletar especialidade:', error);
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
              : 'Erro interno ao deletar especialidade',
          stack: error instanceof Error ? error.stack : null,
        });
      }
    }
  }
);

// Listar todas as especialidades
specialtyRouter.get('/specialties', async (req: Request, res: Response) => {
  try {
    const specialties = await specialtyService.getAllSpecialties();
    res.status(200).json(specialties);
  } catch (error) {
    console.error('Erro ao listar especialidades:', error);
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
            : 'Erro interno ao listar especialidades',
        stack: error instanceof Error ? error.stack : null,
      });
    }
  }
});

// Buscar especialidades por nome
specialtyRouter.get(
  '/specialty/search',
  async (req: Request, res: Response) => {
    const { searchTerm } = req.query;

    if (typeof searchTerm !== 'string' || searchTerm.length < 3) {
      res
        .status(400)
        .json({ error: 'O termo de pesquisa deve ter pelo menos 3 letras.' });
      return;
    }

    try {
      const specialties =
        await specialtyService.searchSpecialtiesByName(searchTerm);
      res.status(200).json(specialties);
    } catch (error) {
      console.error('Erro ao buscar especialidades:', error);
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
              : 'Erro interno ao buscar especialidades',
          stack: error instanceof Error ? error.stack : null,
        });
      }
    }
  }
);

export default specialtyRouter;
