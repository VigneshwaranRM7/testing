// Importing package
import { Schema, model } from "mongoose";

// Importing interfaces
import { LicenseAndCertificateInterface } from "../interfaces/models.interface";
const schema = new Schema<LicenseAndCertificateInterface>(
    {
        credentialId: { type: String, required: true },
        studentId: { type: String, required: true },
        name: { type: String, required: true },
        issuedOrganization: { type: String, required: true },
        // doneVia: { type: String, required: true },
        issueMonth: { type: String, required: true },
        issueYear: { type: String, required: true },
        expirationMonth: { type: String, required: false },
        expirationYear: { type: String, required: false },
        credentialID: { type: String, required: false },
        credentialURL: { type: String, required: false },
        noExpirationDate: { type: Boolean, default: false },
        youtubeLearningId: { type: String, required: false },
        youtubeAssessmentId: { type: String, required: false },
        isVerified: { type: Boolean, default: false, required: false },
    },
    { timestamps: true }
);

export default model<LicenseAndCertificateInterface>("license_and_certificates", schema);
