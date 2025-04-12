export default {
    email: {
        charSet: "UTF-8",
        subject: {
            passwordReset: "Password Reset Request",
            welcome: "Welcome to GetRecord.in",
            verifyEmail: "Email Address Verification Request",
            loginOTP: "Login OTP for GetRecord.in",
        },
        source: {
            teamMail: "GetRecord Team <team@getrecord.in>",
            noreplyMail: "GetRecord Team <no-reply@getrecord.in>",
        },
    },
    profileVerificationEmail: {
        workExperience: {
            title: "Employment Verification Required",
            subjectPrefix: (studentName: string) => `Record: Verification of employment to ${studentName}`,
        },
        project: {
            title: "Project Verification Required",
            subjectPrefix: (studentName: string) => `Record: Verification of project to ${studentName}`,
        },
        education: {
            title: "Education Records Verification Required",
            subjectPrefix: (studentName: string) => `Record: Verification of education to ${studentName}`,
        },
    },
    revisionRequestEmail: {
        workExperience: {
            title: "Update Your Employment Details",
            subject: "Record: Experience revision request",
        },
        project: {
            title: "Update Your Project Details",
            subject: "Record: Project revision request",
        },
        education: {
            title: "Update Your Education Details",
            subject: "Record: Education revision request",
        },
    },
    emailTemplate: {
        profileVerificationEmailTemplate: "PROFILE_VERIFICATION_EMAIL_TEMPLATE",
        revisionRequestEmailTemplate: "REVISION_REQUEST_EMAIL_TEMPLATE",
        otpTemplate: "STUDENT_OTP_EMAIL_TEMPLATE",
        productAssignmentEmailTemplate: "PRODUCT_ASSIGNMENT_EMAIL_TEMPLATE",
    },
};
