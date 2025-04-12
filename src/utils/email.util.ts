import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "../config/aws.config";
import emailConstant from "../constants/email.constant";

const handleSendEmail = async (payload: any) => {
    const { toAddresses = [], subject = "", htmlData = "", ccEmails = [], source = "" } = payload;
    const emailPayload = {
        Destination: {
            CcAddresses: ccEmails,
            ToAddresses: toAddresses,
        },
        Message: {
            Body: {
                Html: {
                    Charset: emailConstant.email.charSet,
                    Data: htmlData,
                },
            },
            Subject: {
                Charset: emailConstant.email.charSet,
                Data: subject,
            },
        },
        Source: source,
    };

    return sesClient
        .send(new SendEmailCommand(emailPayload))
        .then(() => {
            return true;
        })
        .catch((err: any) => {
            return false;
        });
};

export default {
    handleSendEmail,
};
