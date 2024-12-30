import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import CustomError from '../utils/CustomError';

interface AuthenticatedRequest extends Request {
    userId?: number;
    userType?: string;
}

export default function verifyToken(requiredType?: string | string[]) {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        const token = req.headers['token'] as string;

        if (!token) {
            return next(new CustomError('Token não fornecido.', 401, 'TOKEN_NOT_PROVIDED'));
        }

        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY as string) as JwtPayload & { id: number; type: string };
            req.userId = decoded.id;
            req.userType = decoded.type;

            // Verificando o tipo do usuário
            if (requiredType) {
                if (Array.isArray(requiredType)) {
                    // Se requiredType for um array, verifica se o tipo de usuário está no array
                    if (!requiredType.includes(decoded.type)) {
                        return next(new CustomError('Acesso negado: Tipo de usuário não autorizado.', 403, 'ACCESS_DENIED'));
                    }
                } else {
                    // Se requiredType for uma string, compara diretamente
                    if (decoded.type !== requiredType) {
                        return next(new CustomError('Acesso negado: Tipo de usuário não autorizado.', 403, 'ACCESS_DENIED'));
                    }
                }
            }

            next();
        } catch (error) {
            return next(handleTokenError(error));
        }
    };
}

function handleTokenError(error: unknown): CustomError {
    if (error instanceof jwt.TokenExpiredError) {
        return new CustomError('Token expirado. Faça login novamente.', 401, 'TOKEN_EXPIRED');
    } else if (error instanceof jwt.JsonWebTokenError) {
        return new CustomError('Token inválido.', 401, 'INVALID_TOKEN');
    } else {
        console.error('Erro inesperado na verificação do token:', error);
        return new CustomError('Erro interno ao processar o token.', 500, 'INTERNAL_ERROR');
    }
}
