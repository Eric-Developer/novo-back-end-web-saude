import { Router, Request, Response } from "express";
import userService from "../services/userService";
import { validateFields } from "../validators/validateFields";
import CustomError from "../utils/CustomError";

const userRouter = Router();

// Route para listar os usuários
userRouter.get("/search/users", async (req: Request, res: Response) => {
    try {
        const users = await userService.fetchAllUsers();
        res.status(200).json(users);

    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                error: error.message,
                code: error.errorCode,
                details: error.details
            });
        } else {
            const unknownError = new CustomError("Erro interno do servidor", 500, "INTERNAL_SERVER_ERROR");
            res.status(unknownError.statusCode).json({
                error: unknownError.message,
                code: unknownError.errorCode,
                details: unknownError.details
            });
        }
    }
});

// Rota para listar um único usuário
userRouter.get("/search/user/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const user = await userService.fetchUserById(Number(id));
        res.status(200).json(user);

    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                error: error.message,
                code: error.errorCode,
                details: error.details
            });
        } else {
            const notFoundError = new CustomError("Usuário não encontrado", 404, "USER_NOT_FOUND");
            res.status(notFoundError.statusCode).json({
                error: notFoundError.message,
                code: notFoundError.errorCode,
                details: notFoundError.details
            });
        }
    }
});

// Rota para alterar informações do usuário
userRouter.put("/update/user/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const updateValidationRules = [
            { field: "name", required: true },
            { field: "email", required: true, isEmail: true },
            { field: "phone", required: true },
        ];

        const errors = validateFields(req.body, updateValidationRules);

        if (errors.length) {
            res.status(400).json({ errors });
            return;
        }

        const updatedUser = await userService.modifyUser(Number(id), req.body);
        res.status(200).json(updatedUser);

    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                error: error.message,
                code: error.errorCode,
                details: error.details
            });
        } else {
            const updateError = new CustomError("Erro ao atualizar usuário", 500, "USER_UPDATE_FAILED");
            res.status(updateError.statusCode).json({
                error: updateError.message,
                code: updateError.errorCode,
                details: updateError.details
            });
        }
    }
});

// Rota para alterar a imagem do usuário
userRouter.patch("/update_image/user/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const imageValidationRules = [
            { field: "image", required: true },
        ];

        const errors = validateFields(req.body, imageValidationRules);
        if (errors.length) {
            res.status(400).json({ errors });
            return;
        }

        const { image } = req.body;

        if (!image) {
            const imageError = new CustomError("A imagem é obrigatória", 400, "IMAGE_REQUIRED");
            res.status(imageError.statusCode).json({
                error: imageError.message,
                code: imageError.errorCode,
                details: imageError.details
            });
            return;
        }

        const updatedUser = await userService.updateUserAvatar(Number(id), image);
        res.status(200).json(updatedUser);

    } catch (error) {
        console.error("Erro ao atualizar a imagem do usuário:", error);
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                error: error.message,
                code: error.errorCode,
                details: error.details
            });
        } else {
            const imageUpdateError = new CustomError("Erro ao atualizar a imagem do usuário", 500, "USER_IMAGE_UPDATE_FAILED");
            res.status(imageUpdateError.statusCode).json({
                error: imageUpdateError.message,
                code: imageUpdateError.errorCode,
                details: imageUpdateError.details
            });
        }
    }
});

// Rota para deletar usuário
userRouter.delete("/delete/user/:id", async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await userService.deleteUser(Number(id));
        res.status(204).send();

    } catch (error) {
        console.error("Erro ao deletar usuário:", error);
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                error: error.message,
                code: error.errorCode,
                details: error.details
            });
        } else {
            const deleteError = new CustomError("Erro ao deletar usuário", 500, "USER_DELETE_FAILED");
            res.status(deleteError.statusCode).json({
                error: deleteError.message,
                code: deleteError.errorCode,
                details: deleteError.details
            });
        }
    }
});

export default userRouter;
