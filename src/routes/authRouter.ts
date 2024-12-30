import { Router, Request, Response } from "express";
import AuthService from "../services/authService";
import { validateFields } from "../validators/validateFields";
import CustomError from "../utils/CustomError";

const authRouter = Router();

authRouter.post("/register", async (req: Request, res: Response) => {
    const { name, email, password, phone } = req.body;

    try {
        const updateValidationRules = [
            { field: "name", required: true },
            { field: "email", required: true, isEmail: true },
            { field: "phone", required: true },
            { field: "password", required: true }
        ];

        const errors = validateFields(req.body, updateValidationRules);

        if (errors.length) {
            res.status(400).json({ errors });
            return;
        }

        const pendingUser = await AuthService.register(name, email, password, phone);
        res.status(201).json({
            message: "Usuário registrado",
            user: pendingUser,
        });

    } catch (error) {
        console.error("Erro ao registrar usuário:", error);
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                error: error.message,
                code: error.errorCode,
                details: error.details,
            });
        } else {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Erro ao registrar usuário",
                stack: error instanceof Error ? error.stack : null,
            });
        }
    }
});

authRouter.post('/verify', async (req: Request, res: Response) => {
    const { token, email } = req.body;

    try {
        const user = await AuthService.verifyEmailToken(email, token);
        res.status(200).json({
            message: "Usuário verificado com sucesso",
            user
        });
    } catch (error) {
        console.error("Erro ao verificar usuário:", error);
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                error: error.message,
                code: error.errorCode,
                details: error.details,
            });
        } else {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Erro ao verificar usuário",
                stack: error instanceof Error ? error.stack : null,
            });
        }
    }
});

authRouter.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const updateValidationRules = [
            { field: "email", required: true, isEmail: true },
            { field: "password", required: true }
        ];

        const errors = validateFields(req.body, updateValidationRules);

        if (errors.length) {
            res.status(400).json({ errors });
            return;
        }

        const token = await AuthService.signIn(email, password);
        res.status(200).json({ token });
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        let status = 500;
        let message = "Erro ao fazer login";

        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                error: error.message,
                code: error.errorCode,
                details: error.details,
            });
        } else if (error instanceof Error) {
            if (error.message === "Usuário não encontrado") {
                status = 404;
                message = error.message;
            } else if (error.message === "Email ou senha incorretos") {
                status = 401;
                message = error.message;
            }
            res.status(status).json({ message });
        }
    }
});

authRouter.post('/forgot-password', async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        await AuthService.sendPasswordResetEmail(email);
        res.status(200).json({ message: "Email de recuperação enviado" });
    } catch (error) {
        console.error("Erro ao enviar email de recuperação:", error);
        let status = 500;
        let message = "Erro ao enviar email de recuperação";

        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                error: error.message,
                code: error.errorCode,
                details: error.details,
            });
        } else if (error instanceof Error) {
            if (error.message === "Usuário não encontrado") {
                status = 404;
                message = error.message;
            }
            res.status(status).json({ message });
        }
    }
});

authRouter.post('/reset-password', async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    try {
        await AuthService.resetPassword(token, newPassword);
        res.status(200).json({ message: "Senha redefinida com sucesso." });
    } catch (error) {
        console.error("Erro ao redefinir senha:", error);
        let status = 500;
        let message = "Erro ao redefinir a senha.";

        if (error instanceof CustomError) {
            res.status(error.statusCode).json({
                error: error.message,
                code: error.errorCode,
                details: error.details,
            });
        } else if (error instanceof Error) {
            if (error.message === "Token expirado." || error.message === "Token inválido.") {
                status = 400;
                message = error.message;
            } else if (error.message === "Usuário não encontrado.") {
                status = 404;
                message = error.message;
            }
            res.status(status).json({ message });
        }
    }
});

export default authRouter;
