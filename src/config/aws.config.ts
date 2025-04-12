// Importing packages
import { S3 } from "@aws-sdk/client-s3";
import { SESClient } from "@aws-sdk/client-ses";

export const s3Client = new S3({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY || "",
        secretAccessKey: process.env.AWS_SECRET_KEY || "",
    },
    forcePathStyle: false,
});

export const sesClient = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY || "",
        secretAccessKey: process.env.AWS_SECRET_KEY || "",
    },
});

export default { s3Client, sesClient };
