import { QueryRunner, Repository } from "typeorm";
import AppDataSource from "../database/config";
import Address from "../models/Address";

class AddressService {
    private addressRepository: Repository<Address>;

    constructor() {
        this.addressRepository = AppDataSource.getRepository(Address);
    }

    // Criar um novo endereço
    public async createAddress(addressData: Partial<Address>, queryRunner?: QueryRunner) {
        const address = this.addressRepository.create(addressData);
        if (queryRunner) {
            return queryRunner.manager.save(address);
        }
        return await this.addressRepository.save(address);
    }

    // Atualizar um endereço
    public async updateAddress(id: number, updatedData: Partial<Address>) {
        const address = await this.addressRepository.findOne({ where: { id } });
        if (!address) throw new Error("Endereço não encontrado");
        Object.assign(address, updatedData);
        return await this.addressRepository.save(address);
    }

    // Deletar um endereço
    public async deleteAddress(id: number, queryRunner?: QueryRunner) {
        const address = await this.addressRepository.findOne({ where: { id } });
        if (!address) throw new Error("Endereço não encontrado");
        if (queryRunner) {
            return queryRunner.manager.remove(address);
        }
        return await this.addressRepository.remove(address);
    }
}

export default new AddressService();
