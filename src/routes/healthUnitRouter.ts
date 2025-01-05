import { Router, Request, Response } from "express";
import healthUnitService from "../services/healthUnitService";
import { validateFields } from "../validators/validateFields";
import CustomError from "../utils/CustomError";
import verifyToken from "../middlewares/AuthenticatedRequest";
import { UserRequest } from "../types/UserRequest";
import cloudinaryService from "../services/cloudinaryService";
import upload from "../config/uploadConfig";
import path from "path";
import fs from 'fs';

const healthUnitRouter = Router();

// Criar uma nova unidade de saúde
healthUnitRouter.post("/health-unit", upload.single("image"), verifyToken(["admin", "functional"]), async (req: UserRequest, res: Response) => {
    const { healthUnitData, addressData, specialtyIds} = req.body;
    try {
        const createValidationRules = [
            { field: "name", required: true },
        ];

        const errors = validateFields(healthUnitData, createValidationRules);

        if (!req.file) {
            res.status(400).json({ error: 'Arquivo de imagem não encontrado' })
            return
        }

        const filePath = path.resolve(req.file.path)

        const uploadResult = await cloudinaryService.uploadImage(filePath)
        if (errors.length) {
            res.status(400).json({ errors });
            return;
        }

        const newHealthUnit = await healthUnitService.newHealthUnit(healthUnitData, 
            addressData, specialtyIds, uploadResult,Number(req.userId));
        if (newHealthUnit === null) {
            res.status(409).json({ Message: "Já existe uma unidade de saúde com este nome." });
            return;
        }

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("Erro ao excluir o arquivo local:", err)
            } else {
                console.log("Arquivo local excluído com sucesso")
            }
        })
        
        res.status(201).json(newHealthUnit);
    } catch (error) {
        console.error("Erro ao criar unidade de saúde:", error);
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                error: error.message,
                code: error.errorCode,
                details: error.details
            });
        } else {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Erro ao criar unidade de saúde",
                stack: error instanceof Error ? error.stack : null,
            });
        }
    }
});

// Atualizar uma unidade de saúde
healthUnitRouter.put("/health-unit/:id",upload.single("image"), verifyToken(["admin", "functional"]), async (req: UserRequest, res: Response) => {
    const { id } = req.params;
    const { healthUnitData, addressData} = req.body;
    try {
        
        let imageUrl: string | null = null; // Inicializa como null

        if (req.file?.path) {
            const filePath = path.resolve(req.file.path);
            const uploadResult = await cloudinaryService.uploadImage(filePath);
            imageUrl = uploadResult

        }
        console.log("iamge",imageUrl)

        const updatedHealthUnit = await healthUnitService.updateHealthUnit(Number(req.userId),
        String(req.userType), Number(id), healthUnitData, addressData, imageUrl !== null && imageUrl !== undefined ? imageUrl : undefined
    );

        if (updatedHealthUnit === null) {
            res.status(404).json({ Message: "Unidade de saúde não encontrada!" });
            return;
        }
        res.status(200).json(updatedHealthUnit);
    } catch (error) {
        console.error("Erro ao atualizar unidade de saúde:", error);
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                error: error.message,
                code: error.errorCode,
                details: error.details
            });
        } else {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Erro interno ao atualizar unidade de saúde",
                stack: error instanceof Error ? error.stack : null,
            });
        }
    }
});

// Deletar uma unidade de saúde
healthUnitRouter.delete("/health-unit/:id",verifyToken(["admin", "functional"]), async (req: UserRequest, res: Response) => {
    const { id } = req.params;

    try {
        const deletedHealthUnit = await healthUnitService.deleteHealthUnit(Number(req.userId),
        String(req.userType), Number(id));
        if (!deletedHealthUnit) {
            res.status(404).json({ Message: "Unidade de saúde não encontrada!" });
            return;
        }
        res.status(204).send();
    } catch (error) {
        console.error("Erro ao deletar unidade de saúde:", error);
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                error: error.message,
                code: error.errorCode,
                details: error.details
            });
        } else {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Erro ao deletar unidade de saúde",
                stack: error instanceof Error ? error.stack : null,
            });
        }
    }
});

// Listar todas as unidades de saúde
healthUnitRouter.get("/health-units",verifyToken(""), async (req: UserRequest, res: Response) => {
    try {
        const healthUnits = await healthUnitService.getAllHealthUnits();
        res.status(200).json(healthUnits);
    } catch (error) {
        console.error("Erro ao listar unidades de saúde:", error);
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                error: error.message,
                code: error.errorCode,
                details: error.details
            });
        } else {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Erro interno ao listar unidades de saúde",
                stack: error instanceof Error ? error.stack : null,
            });
        }
    }
});

// Buscar unidades de saúde por nome (com 3 ou mais letras)
healthUnitRouter.get("/health-units/search", async (req: Request, res: Response) => {
    const { searchTerm } = req.query;

    if (typeof searchTerm !== "string" || searchTerm.length < 3) {
        console.log(searchTerm)
        res.status(400).json({ error: "O termo de pesquisa deve ter pelo menos 3 letras." });
        return;
    }

    try {
        const healthUnits = await healthUnitService.searchHealthUnitsByName(searchTerm);
        res.status(200).json(healthUnits);
    } catch (error) {
        console.error("Erro ao buscar unidades de saúde:", error);
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                error: error.message,
                code: error.errorCode,
                details: error.details
            });
        } else {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Erro interno ao buscar unidades de saúde",
                stack: error instanceof Error ? error.stack : null,
            });
        }
    }
});

// Listar unidades de saúde aprovadas
healthUnitRouter.get("/health-units/approved", async (req: Request, res: Response) => {
    try {
        const approvedHealthUnits = await healthUnitService.getApprovedHealthUnits();
        res.status(200).json(approvedHealthUnits);
    } catch (error) {
        console.error("Erro ao listar unidades de saúde aprovadas:", error);
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                error: error.message,
                code: error.errorCode,
                details: error.details
            });
        } else {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Erro interno ao listar unidades de saúde aprovadas",
                stack: error instanceof Error ? error.stack : null,
            });
        }
    }
});

// Listar unidades de saúde não aprovadas
healthUnitRouter.get("/health-units/unapproved",verifyToken("admin"), async (req: Request, res: Response) => {
    try {
        const unapprovedHealthUnits = await healthUnitService.getUnapprovedHealthUnits();
        res.status(200).json(unapprovedHealthUnits);
    } catch (error) {
        console.error("Erro ao listar unidades de saúde não aprovadas:", error);
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                error: error.message,
                code: error.errorCode,
                details: error.details
            });
        } else {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Erro interno ao listar unidades de saúde não aprovadas",
                stack: error instanceof Error ? error.stack : null,
            });
        }
    }
});

// Contar o total de unidades de saúde
healthUnitRouter.get("/health-units/count",verifyToken("admin"), async (req: Request, res: Response) => {
    try {
        const total = await healthUnitService.countTotalHealthUnits();
        res.status(200).json({ total });
    } catch (error) {
        console.error("Erro ao contar unidades de saúde:", error);
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                error: error.message,
                code: error.errorCode,
                details: error.details
            });
        } else {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Erro interno ao obter o total de unidades de saúde",
                stack: error instanceof Error ? error.stack : null,
            });
        }
    }
});

// Listar unidades de saúde do usuário (baseado no ID do usuário)
healthUnitRouter.get("/health-units/user/:userId",verifyToken("functional"), async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const userHealthUnits = await healthUnitService.getHealthUnitsByUserId(Number(userId));
        res.status(200).json(userHealthUnits);
    } catch (error) {
        console.error("Erro ao listar unidades de saúde do usuário:", error);
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                error: error.message,
                code: error.errorCode,
                details: error.details
            });
        } else {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Erro interno ao listar unidades de saúde do usuário",
                stack: error instanceof Error ? error.stack : null,
            });
        }
    }
});

// Filtrar unidades de saúde por tipo
healthUnitRouter.get("/health-units/filter", async (req: Request, res: Response) => {
    const { type } = req.query;

    if (typeof type !== "string") {
        res.status(400).json({ error: "O tipo de unidade de saúde é obrigatório." });
        return;
    }

    try {
        const filteredHealthUnits = await healthUnitService.filterHealthUnitsByType(type);
        res.status(200).json(filteredHealthUnits);
    } catch (error) {
        console.error("Erro ao filtrar unidades de saúde:", error);
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                error: error.message,
                code: error.errorCode,
                details: error.details
            });
        } else {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Erro interno ao filtrar unidades de saúde",
                stack: error instanceof Error ? error.stack : null,
            });
        }
    }
});

// Buscar unidade de saúde pelo nome completo
healthUnitRouter.get("/health-unit/:name", async (req: Request, res: Response) => {
    const { name } = req.params;

    if (typeof name !== "string") {
        res.status(404).json({ error: "Unidade de saúde não encontrada." });
        return;
    }

    try {
        const healthUnit = await healthUnitService.getHealthUnitByName(name);
        res.status(200).json(healthUnit);
    } catch (error) {
        console.error("Erro ao buscar unidade de saúde pelo nome:", error);
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                error: error.message,
                code: error.errorCode,
                details: error.details
            });
        } else {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Erro interno ao buscar unidade de saúde pelo nome",
                stack: error instanceof Error ? error.stack : null,
            });
        }
    }
});

// Buscar unidades de saúde por especialidade
healthUnitRouter.get("/health-units/specialty/:specialtyName", async (req: Request, res: Response) => {
    const { specialtyName } = req.params;

    if (typeof specialtyName !== "string" || !specialtyName.trim()) {
        res.status(400).json({ error: "O nome da especialidade é obrigatório." });
        return;
    }

    try {
        const healthUnits = await healthUnitService.getHealthUnitsBySpecialty(specialtyName);
        res.status(200).json(healthUnits);
    } catch (error) {
        console.error("Erro ao buscar unidades de saúde pela especialidade:", error);
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                error: error.message,
                code: error.errorCode,
                details: error.details
            });
        } else {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Erro interno ao buscar unidades de saúde pela especialidade",
                stack: error instanceof Error ? error.stack : null,
            });
        }
    }
});

// Remover especialidades de uma unidade de saúde
healthUnitRouter.delete("/health-unit/:id/specialties", verifyToken(["admin", "functional"]), async (req: UserRequest, res: Response) => {
    const { id } = req.params;
    const { specialtyIds } = req.body;

    if (!Array.isArray(specialtyIds) || specialtyIds.length === 0) {
        res.status(400).json({ error: "A lista de IDs de especialidades é obrigatória e deve conter pelo menos um ID." });
        return;
    }

    try {
        const removedSpecialties = await healthUnitService.removeSpecialtiesFromHealthUnit(Number(id), specialtyIds);

        if (!removedSpecialties) {
            res.status(404).json({ message: "Unidade de saúde não encontrada ou nenhuma especialidade removida." });
            return;
        }

        res.status(200).json(removedSpecialties );
    } catch (error) {
        console.error("Erro ao remover especialidades da unidade de saúde:", error);
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                error: error.message,
                code: error.errorCode,
                details: error.details
            });
        } else {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Erro interno ao remover especialidades.",
                stack: error instanceof Error ? error.stack : null,
            });
        }
    }
});


export default healthUnitRouter;
