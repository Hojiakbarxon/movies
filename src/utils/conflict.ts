import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
@Injectable()
export class Conflict {
    async mustBeUnique(
        field: object,
        repo,
        entity: string,
        field_name: string,
    ): Promise<object> {
        const exist = await repo.findOne({
            where: field,
        });
        if (exist) {
            throw new ConflictException(
                `The ${entity} with that ${field_name} already exists`,
            );
        }
        return exist;
    }

    async mustExist(
        field: object,
        repo,
        entity: string,
        field_name: string,
    ): Promise<object> {
        const exist = await repo.findOne({
            where: field,
        });
        if (!exist) {
            throw new NotFoundException(
                `The ${entity} with this ${field_name} is not found`,
            );
        }
        return exist;
    }

    async mustBeUniqueOnUpdate(
        id: string,
        field: object,
        repo,
        entity: string,
        field_name: string,
    ): Promise<boolean> {
        const exist = await repo.findOne({
            where: field,
        });

        if (exist && exist.id !== id) {
            throw new ConflictException(
                `The ${entity} with this ${field_name} already exists`,
            );
        }
        return true;
    }
}