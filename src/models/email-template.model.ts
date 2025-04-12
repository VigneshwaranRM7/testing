// Importing package
import { Schema, model } from "mongoose";

// Importing interfaces
import { EmailTemplateInterface } from "../interfaces/models.interface";

const schema = new Schema<EmailTemplateInterface>(
    {
        emailTemplateId: { type: String, required: true },
        name: { type: String, required: true },
        htmlContent: { type: String, required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default model<EmailTemplateInterface>("email_templates", schema);
