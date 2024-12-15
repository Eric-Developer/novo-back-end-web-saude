import AppDataSource from "../database/config";
import User from "../models/User";
import { Repository } from "typeorm";

class UserService {
    private userRepository: Repository<User>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
    }

    // Obter todos os usuários
    public async fetchAllUsers() {
        try {
            const users = await this.userRepository.find();
            return users;
        } catch (error) {
            throw new Error(`Erro ao buscar usuários: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    // Buscar usuário pelo ID
    public async fetchUserById(id: number) {
        try {
            const user = await this.userRepository.findOne({ where: { id } });
            if (!user) throw new Error("Usuário não encontrado");
            return user;
        } catch (error) {
            throw new Error(`Erro ao buscar usuário por ID: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    // Buscar usuário pelo email
    public async fetchUserByEmail(email: string) {
        try {
            const user = await this.userRepository.findOne({ where: { email }});
            if (!user) throw new Error("Usuário não encontrado");
            return user;
        } catch (error) {
            throw new Error(`Erro ao buscar usuário por email: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    // Atualizar dados do usuário
    public async modifyUser(id: number, updatedData: Partial<User>) {
        try {
            const user = await this.fetchUserById(id);
            Object.assign(user, updatedData);
            const updatedUser = await this.userRepository.save(user);
            return updatedUser;
        } catch (error) {
            throw new Error(`Erro ao atualizar dados do usuário: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    // Atualizar imagem do usuário
    public async updateUserAvatar(id: number, image: string) {
        try {
            const user = await this.fetchUserById(id);
            user.image = image;
            const updatedUser = await this.userRepository.save(user);
            return updatedUser;
        } catch (error) {
            throw new Error(`Erro ao atualizar imagem do usuário: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    public async deleteUser(id: number) {
        try {
            const user = await this.fetchUserById(id); 
            await this.userRepository.remove(user); 
            return { message: "Usuário deletado com sucesso" };
        } catch (error) {
            throw new Error(`Erro ao deletar usuário: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}

export default new UserService();
