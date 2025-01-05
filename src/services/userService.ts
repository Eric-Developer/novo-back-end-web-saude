import AppDataSource from "../database/config";
import User from "../models/User";
import { Repository } from "typeorm";
import CustomError from "../utils/CustomError";
import healthUnitService from "./healthUnitService";

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
            if (error instanceof CustomError) throw error;
            throw new CustomError(
                `Erro ao buscar usuários: ${error instanceof Error ? error.message : String(error)}`,
                500,
                'USER_FETCH_FAILED'
            );
        }
    }

    public async fetchUserById(id: number) {
        try {
            const user = await this.userRepository.findOne({ where: { id }, relations: ['healthUnits'] });
            if (!user) throw new CustomError("Usuário não encontrado", 404, "USER_NOT_FOUND");
            return user;
        } catch (error) {
            if (error instanceof CustomError) throw error;
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
            if (error instanceof CustomError) throw error;
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
            if (error instanceof CustomError) throw error;
            throw new CustomError(
                `Erro ao atualizar dados do usuário: ${error instanceof Error ? error.message : String(error)}`,
                500,
                'USER_UPDATE_FAILED'
            );
        }
    }

    public async deleteUser(id: number) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.startTransaction();
    
        try {
            // Garantir que o usuário existe antes de prosseguir
            const user = await this.fetchUserById(id);
            if (!user) {
                throw new CustomError("Usuário não encontrado.", 404, "USER_NOT_FOUND");
            }
    
            // Excluir todas as unidades de saúde associadas ao usuário
            await healthUnitService.deleteAllHealthUnitsByUser(id, queryRunner);
    
            // Excluir o usuário
            await queryRunner.manager.remove(user);
    
            // Confirmar transação
            await queryRunner.commitTransaction();
    
            return { message: "Usuário e todas as unidades de saúde associadas foram excluídos com sucesso." };
        } catch (error) {
            // Reverter transação em caso de erro
            await queryRunner.rollbackTransaction();
    
            if (error instanceof CustomError) throw error;
            throw new CustomError(
                `Erro ao deletar usuário e suas unidades de saúde associadas: ${error instanceof Error ? error.message : String(error)}`,
                500,
                "USER_DELETION_FAILED"
            );
        } finally {
            await queryRunner.release();
        }
    }
    
    public async changeUserImage(id: number, newImage: string) {
        try {
            const user = await this.fetchUserById(id);
            user.image = newImage;
            const updatedUser = await this.userRepository.save(user);
            return updatedUser;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError(
                `Erro ao alterar imagem do usuário: ${error instanceof Error ? error.message : String(error)}`,
                500,
                'USER_IMAGE_CHANGE_FAILED'
            );
        }
    }

    public async getTotalUsers() {
        try {
            const count = await this.userRepository.count();
            return { totalUsers: count };
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError(
                `Erro ao obter o total de usuários: ${error instanceof Error ? error.message : String(error)}`,
                500,
                'USER_COUNT_FAILED'
            );
        }
    }
}

export default new UserService();
