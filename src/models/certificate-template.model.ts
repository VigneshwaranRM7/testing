// Importing package
import { Schema, model } from "mongoose";

// Importing interfaces
import { CertificateTemplateInterface } from "../interfaces/models.interface";

const schema = new Schema<CertificateTemplateInterface>(
    {
        certificateTemplateId: { type: String, required: true },
        name: { type: String, required: true },
        htmlContent: { type: String, required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default model<CertificateTemplateInterface>("certificate_templates", schema);
