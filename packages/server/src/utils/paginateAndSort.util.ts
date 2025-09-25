// utils/paginateAndSort.ts
import type { FilterQuery, Model, SortOrder } from 'mongoose';

export type PaginateOptions = {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: SortOrder;
};

export async function paginateAndSort<T>(
    model: Model<T>,
    query: FilterQuery<T> = {},
    options: PaginateOptions = {}
) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        model.find(query)
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        model.countDocuments(query),
    ]);

    return {
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}
