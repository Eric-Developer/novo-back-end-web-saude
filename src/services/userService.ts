import AppDataSource from "../database/config";
import User from "../models/User";
import { Repository } from "typeorm";
import CustomError from "../utils/CustomError";

class UserService {
    private userRepository: Repository<User>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
    }

    public async fetchAllUsers() {
        try {
            const users = await this.userRepository.find();
            if (users.length === 0) {
                throw new CustomError(
                    'Nenhum usuário encontrado',
                    404,
                    'NO_USERS_FOUND'
                );
            }
            return users;
        } catch (error) {
            throw new CustomError(
                `Erro ao buscar usuários: ${error instanceof Error ? error.message : String(error)}`,
                500,
                'USER_FETCH_FAILED'
            );
        }
    }

    public async fetchUserById(id: number) {
        try {
            const user = await this.userRepository.findOne({ where: { id } });
            if (!user) throw new CustomError("Usuário não encontrado", 404, "USER_NOT_FOUND");
            return user;
        } catch (error) {
            throw new CustomError(
                `Erro ao buscar usuário: ${error instanceof Error ? error.message : String(error)}`,
                500,
                'USER_FETCH_FAILED'
            );
        }
    }

    public async fetchUserByEmail(email: string) {
        try {
            const user = await this.userRepository.findOne({ where: { email } });
            if (!user) throw new CustomError("Usuário não encontrado", 404, "USER_NOT_FOUND");
            return user;
        } catch (error) {
            throw new CustomError(
                `Erro ao buscar usuário por email: ${error instanceof Error ? error.message : String(error)}`,
                500,
                'USER_FETCH_FAILED'
            );
        }
    }

    public async modifyUser(id: number, updatedData: Partial<User>) {
        try {
            const user = await this.fetchUserById(id);
            Object.assign(user, updatedData);
            const updatedUser = await this.userRepository.save(user);
            return updatedUser;
        } catch (error) {
            throw new CustomError(
                `Erro ao atualizar dados do usuário: ${error instanceof Error ? error.message : String(error)}`,
                500,
                'USER_UPDATE_FAILED'
            );
        }
    }

    public async updateUserAvatar(id: number, image: string) {
        try {
            const user = await this.fetchUserById(id);
            user.image = image;
            const updatedUser = await this.userRepository.save(user);
            return updatedUser;
        } catch (error) {
            throw new CustomError(
                `Erro ao atualizar imagem do usuário: ${error instanceof Error ? error.message : String(error)}`,
                500,
                'USER_AVATAR_UPDATE_FAILED'
            );
        }
    }

    public async deleteUser(id: number) {
        try {
            const user = await this.fetchUserById(id); 
            await this.userRepository.remove(user); 
            return { message: "Usuário deletado com sucesso" };
        } catch (error) {
            throw new CustomError(
                `Erro ao deletar usuário: ${error instanceof Error ? error.message : String(error)}`,
                500,
                'USER_DELETION_FAILED'
            ); 
        }
    }
}

export default new UserService();
