// Importing constants

import { recruiterCookie } from "../constants/cookie.constant";

export const getRFSSignature = (cookies: string) => {
    if (!cookies) {
        return null;
    }
    const RFSSignature = cookies
        .split(";")
        .find((cookie: any) => cookie.trim().startsWith(recruiterCookie.signatureCookieName));
    return RFSSignature ? RFSSignature.split("=")[1] : null;
};

export default {
    getRFSSignature,
};
