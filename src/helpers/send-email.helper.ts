// Importing packages
import ejs from "ejs";

// Importing constants
import emailConstant from "../constants/email.constant";

// Importing models
import emailTemplateModel from "../models/email-template.model";
import authService from "../services/auth.service";

/**
 * @createdBy Vignesh
 * @createdAt 2024-07-24
 * @description This function is used to send verification email to verifier
 */
export const sendVerificationEmailToVerifier = async (emailTemplateName: string, emailPayload: any) => {
    try {
        // Fetch email template
        let emailTemplateResponse: any = await emailTemplateModel.findOne({ name: emailTemplateName });

        if (!emailTemplateResponse) {
            throw new Error("Email template not found");
        } else {
            // Pass email payload to email template
            const renderedEmailTemplateResponse = ejs.render(emailTemplateResponse?.htmlContent, { ...emailPayload });

            // Send email
            await authService.handleSendEmail({
                toAddresses: [emailPayload?.email],
                source: emailConstant.email.source.noreplyMail,
                subject: emailPayload?.subject,
                htmlData: renderedEmailTemplateResponse,
            });
        }
    } catch (err) {
        throw new Error(err as string);
    }
};

export default {
    sendVerificationEmailToVerifier,
};
