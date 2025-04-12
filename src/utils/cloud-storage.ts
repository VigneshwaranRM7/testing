import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Readable } from "stream";
import { s3Client } from "../config/aws.config";
import envConfig from "../config/env";
import logger from "../config/logger";
import ApiError from "./api-error";
import httpStatus from "http-status";

class CloudStorage {
    async uploadFile(file: Express.Multer.File): Promise<string> {
        try {
            const key = `profiles/${Date.now()}-${file.originalname}`;

            const upload = new Upload({
                client: s3Client,
                params: {
                    Bucket: envConfig.aws.bucketName,
                    Key: key,
                    Body: Readable.from(file.buffer),
                    ContentType: file.mimetype,
                    ContentDisposition: `inline; filename="${file.originalname}"`,
                },
            });

            let uploadStartTime = Date.now();
            const UPLOAD_TIMEOUT = 30000; // 30 seconds

            upload.on("httpUploadProgress", () => {
                if (Date.now() - uploadStartTime > UPLOAD_TIMEOUT) {
                    upload.abort();
                    throw new ApiError(httpStatus.REQUEST_TIMEOUT, "Upload timed out");
                }
                logger.info("Upload progressing...");
            });

            const result = await upload.done();

            if (!result.Location) {
                throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to upload file");
            }

            logger.info("File uploaded successfully", result.Location);
            return result.Location;
        } catch (error) {
            logger.error("Error in uploadFile:", error);
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to upload file");
        }
    }

    async deleteFile(fileUrl: string): Promise<void> {
        try {
            if (!fileUrl) {
                logger.warn("No file URL provided for deletion");
                return;
            }

            let key: string;
            try {
                const url = new URL(fileUrl);
                // Extract the path without the leading slash
                key = url.pathname.substring(1);
            } catch (error) {
                logger.error("Invalid S3 URL format:", fileUrl);
                throw new ApiError(httpStatus.BAD_REQUEST, "Invalid file URL format");
            }

            if (!key) {
                logger.error("Could not extract key from URL:", fileUrl);
                throw new ApiError(httpStatus.BAD_REQUEST, "Invalid file URL");
            }

            await s3Client.send(
                new DeleteObjectCommand({
                    Bucket: envConfig.aws.bucketName,
                    Key: key,
                })
            );

            logger.info("File deleted successfully");
        } catch (error) {
            logger.error("Error in deleteFile:", error);
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to delete file");
        }
    }
}

export default new CloudStorage();
