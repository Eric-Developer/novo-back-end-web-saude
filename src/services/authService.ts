import CustomError from "../utils/CustomError"; 
import AppDataSource from "../database/config";
import PendingUser, { PendingUserStatus } from "../models/PendingUser";
import User from "../models/User";
import { Repository } from "typeorm";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendAccountVerificationEmail, sendPasswordRecoveryEmail } from "../utils/emails";

class AuthService {
    private userRepository: Repository<User>;
    private pendingUserRepository: Repository<PendingUser>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
        this.pendingUserRepository = AppDataSource.getRepository(PendingUser);
    }

    private async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    public async register(name: string, email: string, password: string, phone: string): Promise<PendingUser | null> {
        try {
            const emailExists = await this.userRepository.findOne({ where: { email } });
            if (emailExists) {
                throw new CustomError("Usuário com este email já existe", 400, "USER_EXISTS");
            }

            const existingPendingUser = await this.pendingUserRepository.findOne({ where: { email } });
            if (existingPendingUser) {
                if (existingPendingUser.status === 'pending') {
                    existingPendingUser.name = name;
                    existingPendingUser.phone = phone;
                    existingPendingUser.password = await this.hashPassword(password);
                    await this.pendingUserRepository.save(existingPendingUser);

                    const secretKey = process.env.SECRET_KEY;
                    if (!secretKey) {
                        throw new CustomError("SECRET_KEY não está definido nas variáveis de ambiente", 500, "MISSING_SECRET_KEY");
                    }

                    const token = jwt.sign({ id: existingPendingUser.id }, secretKey, { expiresIn: '1h' });
                    sendAccountVerificationEmail(email, token);

                    return existingPendingUser;
                } else {
                    throw new CustomError("Usuário já verificado", 400, "USER_ALREADY_VERIFIED");
                }
            }

            const hashedPassword = await this.hashPassword(password);
            const pendingUser = this.pendingUserRepository.create({
                name,
                email,
                password: hashedPassword,
                phone,
            });

            await this.pendingUserRepository.save(pendingUser);

            const secretKey = process.env.SECRET_KEY;
            if (!secretKey) {
                throw new CustomError("SECRET_KEY não está definido nas variáveis de ambiente", 500, "MISSING_SECRET_KEY");
            }

            const token = jwt.sign({ id: pendingUser.id }, secretKey, { expiresIn: '1h' });
            sendAccountVerificationEmail(email, token);

            return pendingUser;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError("Erro ao registrar usuário", 500, "REGISTRATION_ERROR", error);
        }
    }

    public async verifyEmailToken(email: string, token: string): Promise<User | null> {
        const pendingUser = await this.pendingUserRepository.findOne({ where: { email, status: PendingUserStatus.PENDING } });
        if (!pendingUser) {
            throw new CustomError("Usuário não encontrado ou já verificado", 404, "USER_NOT_FOUND");
        }

        const secretKey = process.env.SECRET_KEY;
        if (!secretKey) {
            throw new CustomError("SECRET_KEY não está definido nas variáveis de ambiente", 500, "MISSING_SECRET_KEY");
        }

        try {
            const decodedToken = jwt.verify(token, secretKey) as { id: number };
            if (decodedToken.id !== pendingUser.id) {
                throw new CustomError("Token inválido para o usuário fornecido.", 400, "INVALID_TOKEN");
            }
            pendingUser.status = PendingUserStatus.VERIFIED;
            await this.pendingUserRepository.save(pendingUser);

            const newUser = this.userRepository.create({
                name: pendingUser.name,
                email: pendingUser.email,
                password: pendingUser.password,
                phone: pendingUser.phone,
            });
            await this.userRepository.save(newUser);

            await this.pendingUserRepository.remove(pendingUser);

            return newUser;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new CustomError("Token expirado", 400, "EXPIRED_TOKEN");
            } else if (error instanceof jwt.JsonWebTokenError) {
                throw new CustomError("Token inválido", 400, "INVALID_TOKEN");
            } else if (error instanceof CustomError) {
                throw error;
            }

            throw new CustomError("Erro ao verificar o email", 500, "VERIFY_EMAIL_ERROR", error);
        }
    }

    public async signIn(email: string, password: string) {
        const user = await this.userRepository.findOne({
            where: { email },
            select: ["id", "password", "user_type"],
        });

        if (!user) {
            throw new CustomError("Usuário não encontrado", 404, "USER_NOT_FOUND");
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            throw new CustomError("Email ou senha incorretos", 401, "INVALID_CREDENTIALS");
        }

        const secretKey = process.env.SECRET_KEY;
        if (!secretKey) {
            throw new CustomError("SECRET_KEY não está definido nas variáveis de ambiente", 500, "MISSING_SECRET_KEY");
        }

        const token = jwt.sign({ id: user.id, type: user.user_type }, secretKey, { expiresIn: '12h' });
        return token;
    }

    public async sendPasswordResetEmail(email: string) {
        const user = await this.userRepository.findOne({
            where: { email },
        });
        if (!user) {
            throw new CustomError("Usuário não encontrado", 404, "USER_NOT_FOUND");
        }

        const secretKey = process.env.SECRET_KEY;
        if (!secretKey) {
            throw new CustomError("SECRET_KEY não está definido nas variáveis de ambiente", 500, "MISSING_SECRET_KEY");
        }

        const token = jwt.sign({ email: email }, secretKey, { expiresIn: '1h' });

        await sendPasswordRecoveryEmail(email, token);
        return;
    }

    public async resetPassword(token: string, newPassword: string) {
        const secretKey = process.env.SECRET_KEY;
        if (!secretKey) {
            throw new CustomError("SECRET_KEY não está definido nas variáveis de ambiente", 500, "MISSING_SECRET_KEY");
        }
        try {
            const decodedToken = jwt.verify(token, secretKey) as { email: string };

            const user = await this.userRepository.findOne({
                where: { email: decodedToken.email },
            });

            if (!user) {
                throw new CustomError("Usuário não encontrado", 404, "USER_NOT_FOUND");
            }

            const hashedPassword = await this.hashPassword(newPassword);
            user.password = hashedPassword;
            await this.userRepository.save(user);

        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new CustomError("Token expirado", 400, "EXPIRED_TOKEN");
            } else if (error instanceof jwt.JsonWebTokenError) {
                throw new CustomError("Token inválido", 400, "INVALID_TOKEN");
            } else if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError("Erro ao verificar o email", 500, "RESET_PASSWORD_ERROR", error);
        }
    }
}

export default new AuthService();
