import { Router, Request, Response } from "express";
import userService from "../services/userService";
import { validateFields } from "../validators/validateFields";

const userRouter = Router();


// Route to search all users
userRouter.get("/search/users", async (req: Request, res: Response) => {
    try {
        const users = await userService.fetchAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "Internal server error" });
    }
});

// Route to search user by ID
userRouter.get("/search/user/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const user = await userService.fetchUserById(Number(id));
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({ error: error instanceof Error ? error.message : "User not found" });
    }
});

// Route to update user
userRouter.put("/update/user/:id", async (req: Request, res: Response) => {
   
    try {
        const { id } = req.params;
        
        // Definindo as regras de validação para os campos obrigatórios
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
        res.status(500).json({ error: error instanceof Error ? error.message : "Error updating user" });
    }
});

// Route to update user image
userRouter.patch("/update_image/user/:id", async (req: Request, res: Response) => {
   
    try {
        const imageValidationRules = [
            {
                field: "image",
                required: true, 
            }
        ];

        // Validação dos campos de imagem
        const errors = validateFields(req.body, imageValidationRules);
        if (errors.length) {
            res.status(400).json({ errors });
            return
        }
        const { id } = req.params;
        const { image } = req.body;
    
        if (!image) {
            res.status(400).json({ error: "Image is required" });
            return
        }
        const updatedUser = await userService.updateUserAvatar(Number(id), image);
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "Error updating image" });
    }
});

// Route to delete user
userRouter.delete("/delete/user/:id", async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await userService.deleteUser(Number(id));
        res.status(200).json({ message: "User successfully deleted" });
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : "Error deleting user" });
    }
});

export default userRouter;



