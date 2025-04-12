import multer from "multer";
import multerS3 from "multer-s3";
import { Request } from "express";
import { HttpStatusCode } from "axios";
import ApiError from "./api-error";
import { s3Client } from "../config/aws.config";
import envConfig from "../config/env";
import logger from "../config/logger";

// Allowed file types
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const ALLOWED_DOCUMENT_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
];

// File size limit (10MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Configure memory storage for CSV files
const csvStorage = multer.memoryStorage();

// CSV file filter
const csvFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype !== "text/csv") {
        cb(new ApiError(HttpStatusCode.BadRequest, "Only CSV files are allowed"));
        return;
    }

    if (file.size && file.size > MAX_FILE_SIZE) {
        cb(new ApiError(HttpStatusCode.BadRequest, "File size cannot exceed 50MB"));
        return;
    }

    cb(null, true);
};

// Create multer instance for CSV files
const csvUpload = multer({
    storage: csvStorage,
    fileFilter: csvFileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
});

// Configure storage using existing S3 client
const storage = multerS3({
    s3: s3Client,
    bucket: envConfig.aws.bucketName,
    metadata: (_req: Request, file: Express.Multer.File, cb: (error: any, metadata?: any) => void) => {
        cb(null, { fieldName: file.fieldname });
    },
    key: (_req: Request, file: Express.Multer.File, cb: (error: any, key?: string) => void) => {
        const folder = file.mimetype.startsWith("image/") ? "images" : "documents";
        const filename = `${folder}/${Date.now()}-${file.originalname}`;
        cb(null, filename);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    contentDisposition: "inline",
});

// Document file filter
const documentFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // if (!ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
    //     cb(new ApiError(HttpStatusCode.BadRequest, "Invalid document type. Allowed types: PDF, Word, Excel, CSV"));
    //     return;
    // }

    if (file.size && file.size > MAX_FILE_SIZE) {
        cb(new ApiError(HttpStatusCode.BadRequest, "File size cannot exceed 50MB"));
        return;
    }

    cb(null, true);
};

// Image file filter
const imageFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        cb(new ApiError(HttpStatusCode.BadRequest, "Invalid image type. Allowed types: PNG, JPEG, JPG"));
        return;
    }

    if (file.size && file.size > MAX_FILE_SIZE) {
        cb(new ApiError(HttpStatusCode.BadRequest, "File size cannot exceed 50MB"));
        return;
    }

    cb(null, true);
};

// Create multer instances with configuration
const documentUpload = multer({
    storage: storage,
    fileFilter: documentFileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
});

const imageUpload = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
});

// Combined upload for both images and documents
const combinedUpload = multer({
    storage: storage,
    fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        logger.info(`File type:", file: ${file.mimetype}`);
        if (ALLOWED_IMAGE_TYPES.includes(file.mimetype) || ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new ApiError(HttpStatusCode.BadRequest, "Invalid file type"));
        }
    },
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
});

export default {
    documentUpload,
    imageUpload,
    combinedUpload,
    csvUpload,
};
