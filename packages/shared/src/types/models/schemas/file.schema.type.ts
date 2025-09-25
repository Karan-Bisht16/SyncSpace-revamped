export const ResourceTypes = ['image', 'video', 'raw', 'auto'] as const;
export type ResourceType = typeof ResourceTypes[number];

export type FileSchema = {
    url: string,
    publicId: string
    resourceType: ResourceType,
    format: string,
};