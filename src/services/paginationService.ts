import { Repository, SelectQueryBuilder, ObjectLiteral } from 'typeorm';

// Tipo para filtros genéricos
export type Filters<T> = {
  [K in keyof T]?: T[K];
};

// Classe de serviço de paginação
export class PaginationService<T extends ObjectLiteral> {
  constructor(private repository: Repository<T>) {}

  // Função com paginação e filtros
  async findWithPagination(
    filters: Filters<T>,
    page: number = 1,
    limit: number = 4,
    relations: string[] = [],
    queryCallback?: (qb: SelectQueryBuilder<T>) => void // Callback opcional para personalizar a query
  ): Promise<{ data: T[]; totalPages: number; page: number; limit: number }> {
    const queryBuilder: SelectQueryBuilder<T> =
      this.repository.createQueryBuilder('entity');

    // Aplica os filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryBuilder.andWhere(`entity.${key} = :${key}`, { [key]: value });
      }
    });

    // Adiciona as relações
    relations.forEach((relation) => {
      queryBuilder.leftJoinAndSelect(`entity.${relation}`, relation);
    });

    // Aplica o callback personalizado para modificar o queryBuilder
    queryCallback?.(queryBuilder);

    // Aplica a paginação
    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      totalPages,
      page,
      limit,
    };
  }
}
