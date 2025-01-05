import AppDataSource from "../database/config";
import OperatingHours, { Day } from "../models/OperatingHours";
import { Repository } from "typeorm";
import CustomError from "../utils/CustomError"; 

class OperatingHoursService {
    private operatingHoursRepository: Repository<OperatingHours>;

    constructor() {
        this.operatingHoursRepository = AppDataSource.getRepository(OperatingHours);
    }

    public async create(data: Partial<OperatingHours>): Promise<OperatingHours> {
        await this.validateOperatingHoursConflict(data);

        const newOperatingHours = this.operatingHoursRepository.create(data);
        return await this.operatingHoursRepository.save(newOperatingHours);
    }

    public async getAll(): Promise<OperatingHours[]> {
        return await this.operatingHoursRepository.find({
            relations: ["health_unit"], 
        });
    }

    public async getById(id: number): Promise<OperatingHours | null> {
        return await this.operatingHoursRepository.findOne({
            where: { id },
            relations: ["health_unit"], 
        });
    }

    public async getByHealthUnitId(healthUnitId: number): Promise<OperatingHours[]> {
        return await this.operatingHoursRepository.find({
            where: { health_unit_id: healthUnitId },
            relations: ["health_unit"],
        });
    }

    public async update(id: number, data: Partial<OperatingHours>): Promise<OperatingHours> {
        const operatingHours = await this.getById(id);
        if (!operatingHours) {
            throw new CustomError("Horário de funcionamento não encontrado", 404, "OPERATING_HOURS_NOT_FOUND", { id });
        }

        await this.validateOperatingHoursConflict(data, id);
        Object.assign(operatingHours, data);

        return await this.operatingHoursRepository.save(operatingHours);
    }

    public async delete(id: number): Promise<void> {
        const operatingHours = await this.getById(id);
        if (!operatingHours) {
            throw new CustomError("Horário de funcionamento não encontrado", 404, "OPERATING_HOURS_NOT_FOUND", { id });
        }

        await this.operatingHoursRepository.remove(operatingHours);
    }

    private async validateOperatingHoursConflict(
        data: Partial<OperatingHours>,
        currentId?: number
    ): Promise<void> {
        if (!data.health_unit_id || !data.day_of_week) {
            throw new CustomError("Unidade de saúde e dia da semana são obrigatórios", 400, "MISSING_REQUIRED_FIELDS", data);
        }

        const existingHours = await this.findExistingOperatingHours(data.health_unit_id, data.day_of_week);

        const conflictingHours = existingHours.filter((existing) => 
            this.hasConflict(existing, data, currentId)
        );

        if (conflictingHours.length > 0) {
            const conflictMessages = this.getConflictMessages(conflictingHours);
            throw new CustomError(`Conflito de horário detectado: ${conflictMessages.join("; ")}`, 409, "OPERATING_HOURS_CONFLICT", conflictingHours);
        }
    }

    private async findExistingOperatingHours(healthUnitId: number, dayOfWeek: Day) {
        return await this.operatingHoursRepository.find({
            where: {
                health_unit_id: healthUnitId, 
                day_of_week: dayOfWeek,
            },
        });
    }

    private hasConflict(existing: OperatingHours, data: Partial<OperatingHours>, currentId?: number): boolean {
        if (currentId && existing.id === currentId) {
            return false;
        }

        if (existing.is_closed || data.is_closed) {
            return true;
        }

        if (existing.open_time && existing.close_time && data.open_time && data.close_time) {
            return this.isTimeConflict(existing.open_time, existing.close_time, data.open_time, data.close_time);
        }

        return false;
    }

    private isTimeConflict(
        existingOpenTime: string,
        existingCloseTime: string,
        newOpenTime: string,
        newCloseTime: string
    ): boolean {
        const existingOpen = new Date(`1970-01-01T${existingOpenTime}Z`);
        const existingClose = new Date(`1970-01-01T${existingCloseTime}Z`);
        const newOpen = new Date(`1970-01-01T${newOpenTime}Z`);
        const newClose = new Date(`1970-01-01T${newCloseTime}Z`);

        return (
            (newOpen >= existingOpen && newOpen <= existingClose) ||
            (newClose >= existingOpen && newClose <= existingClose) ||
            (newOpen <= existingOpen && newClose >= existingClose)
        );
    }

    private getConflictMessages(conflictingHours: OperatingHours[]): string[] {
        return conflictingHours.map((conflict) => {
            return `Dia: ${this.getDayName(conflict.day_of_week)}, Horário: ${conflict.open_time} - ${conflict.close_time}`;
        });
    }

    private getDayName(day: Day): string {
        return Object.keys(Day).find((key) => Day[key as keyof typeof Day] === day) || day;
    }
}

export default new OperatingHoursService();
