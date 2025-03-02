import { Router, Request, Response } from 'express';
import operatingHoursService from '../services/operatingHoursService';
import CustomError from '../utils/CustomError';

const operatingHoursRouter = Router();

operatingHoursRouter.post(
  '/operating-hours',
  async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const newOperatingHours = await operatingHoursService.create(data);
      res.status(201).json(newOperatingHours);
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({
          message: error.message,
          code: error.errorCode,
          details: error.details,
        });
      } else if (error instanceof Error) {
        res.status(500).json({
          message: error.message,
        });
      } else {
        res.status(500).json({
          message: 'Erro desconhecido ao adicionar horário',
        });
      }
    }
  }
);

operatingHoursRouter.get(
  '/operating-hours/health-unit/:id',
  async (req: Request, res: Response) => {
    try {
      const healthUnitId = parseInt(req.params.id, 10);
      const operatingHours =
        await operatingHoursService.getByHealthUnitId(healthUnitId);
      res.status(200).json(operatingHours);
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({
          message: error.message,
          code: error.errorCode,
          details: error.details,
        });
      } else {
        res.status(500).json({ error });
      }
    }
  }
);

operatingHoursRouter.put(
  '/operating-hours',
  async (req: Request, res: Response) => {
    try {
      const data = req.body; // Esperando um array de objetos
      const updatedOperatingHours = await operatingHoursService.update(data);
      res.status(200).json(updatedOperatingHours);
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({
          message: error.message,
          code: error.errorCode,
          details: error.details,
        });
      } else if (error instanceof Error) {
        res.status(500).json({
          message: error.message,
        });
      } else {
        res.status(500).json({
          message: 'Erro desconhecido ao atualizar horário',
        });
      }
    }
  }
);

operatingHoursRouter.delete(
  '/operating-hours/:id',
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      await operatingHoursService.delete(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({
          message: error.message,
          code: error.errorCode,
          details: error.details,
        });
      } else {
        res.status(500).json({ message: 'Erro ao excluir horário', error });
      }
    }
  }
);

export default operatingHoursRouter;
