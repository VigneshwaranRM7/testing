export const recruiterCookie = {
    signatureCookieName: "RFC-Signature",
    cookie: {
        maxAge: 34560000,
        httpOnly: false,
        secure: true,
        sameSite: "none",
        expires: new Date(Date.now() + 34560000 * 1000),
    },
};

export const collaboratorCookie = {
    signatureCookieName: "RFC-Signature",
    cookie: {
        maxAge: 34560000 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(Date.now() + 34560000 * 1000),
    },
};

export const testerCredentials = {
    username: "rfs@tester",
    password: "rfs@test123",
};
