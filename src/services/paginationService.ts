import { Repository, SelectQueryBuilder, ObjectLiteral } from "typeorm";

export type Filters<T> = {
  [K in keyof T]?: T[K];
};

export class PaginationService<T extends ObjectLiteral> {
  constructor(private repository: Repository<T>) {}

  async findWithPagination(
    filters: Filters<T>, 
    page: number = 1,
    limit: number = 10,
    relations: string[] = []
  ): Promise<{ data: T[]; total: number; page: number; limit: number }> {
    const queryBuilder: SelectQueryBuilder<T> = this.repository.createQueryBuilder("entity");

    Object.keys(filters).forEach((key) => {
      const filterKey = String(key) as keyof T;
      const filterValue = filters[filterKey];

      if (filterValue !== undefined && filterValue !== null) {
        queryBuilder.andWhere(`entity.${String(filterKey)} = :${String(filterKey)}`, {
          [filterKey]: filterValue,
        });
      }
    });

    if (relations.length > 0) {
      relations.forEach((relation) => {
        queryBuilder.leftJoinAndSelect(`entity.${relation}`, relation);
      });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
