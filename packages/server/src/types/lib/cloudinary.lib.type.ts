export type UploadToCloudinaryParams = {
    fileBuffer: Express.Multer.File['buffer'],
};

export type DeleteFromCloudinaryParams = {
    publicId: string,
};

export type UploadFilesToCloudinaryParams = {
    files: Express.Multer.File[],
    aggregateSizeLimitMB: number,
};

export type DeleteFilesFromCloudinaryParams = {
    publicIds: string[],
};