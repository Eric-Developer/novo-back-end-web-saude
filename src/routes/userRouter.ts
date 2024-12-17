import { Router, Request, Response } from "express";
import userService from "../services/userService";
import { validateFields } from "../validators/validateFields";

const userRouter = Router();


// Route paea listar os usuários
userRouter.get("/search/users", async (req: Request, res: Response) => {
    try {
        const users = await userService.fetchAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "Erro interno do servidor" });
    }
});

// Rota para listar um único usuário
userRouter.get("/search/user/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const user = await userService.fetchUserById(Number(id));
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({ error: error instanceof Error ? error.message : "Usuário não encontrado" });
    }
});

// Rota para alterar informações do usuário
userRouter.put("/update/user/:id", async (req: Request, res: Response) => {
   
    try {
        const { id } = req.params;
        
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
        res.status(500).json({ error: error instanceof Error ? error.message : "Erro ao atualizar usuário" });

    }
});

// Rota para alterar a imagem do usuário
userRouter.patch("/update_image/user/:id", async (req: Request, res: Response) => {
   
    try {
        const imageValidationRules = [
            {
                field: "image",
                required: true, 
            }
        ];

        const errors = validateFields(req.body, imageValidationRules);
        if (errors.length) {
            res.status(400).json({ errors });
            return
        }
        const { id } = req.params;
        const { image } = req.body;
    
        if (!image) {
            res.status(400).json({ error: "A imagem é obrigatória" });
            return
        }
        const updatedUser = await userService.updateUserAvatar(Number(id), image);
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "Erro ao atualizar a imagem" });
    }
});

// Rota para deletar usuário
userRouter.delete("/delete/user/:id", async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await userService.deleteUser(Number(id));
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "Erro ao deletar usuário" });
    }
});

export default userRouter;



