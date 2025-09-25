// importing types
import type { IsFileAcceptedParams } from '../types/index.js';

export const isFileAccepted = (params: IsFileAcceptedParams): boolean => {
    const { file, accept } = params;

    const acceptedTypes = accept.split(',').map(type => type.trim());

    const fileType = 'type' in file ? file.type : file.mimetype;
    const fileName = 'name' in file ? file.name : file.originalname;

    return acceptedTypes.some(type => {
        if (type === '') {
            return false;
        }

        if (type === fileType) {
            return true;
        }

        if (type.endsWith('/*')) {
            const baseType = type.split('/')[0];
            return fileType?.startsWith(baseType + '/');
        }

        if (type.startsWith('.')) {
            return fileName?.toLowerCase().endsWith(type.toLowerCase());
        }

        return false;
    });
};

export const isMulterFile = (file: unknown): file is Express.Multer.File => {
    if (!file || typeof file !== 'object') {
        return false;
    }

    const requiredKeys = ['fieldname', 'originalname', 'encoding', 'mimetype', 'buffer', 'size'];
    for (const key of requiredKeys) {
        if (!(key in file)) {
            return false;
        }
    }

    return true;
};