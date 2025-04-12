import Joi from "joi";

const loginWithGoogleSchema = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().required(),
        google_id: Joi.string().required(),
        profile_picture_url: Joi.string(),
    }),
};

const signUpSchema = {
    body: Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        name: Joi.string().required(),
    }),
};

const logInWithPasswordSchema = {
    body: Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }),
};

const forgotPasswordSchema = {
    body: Joi.object().keys({
        email: Joi.string().email().required(),
    }),
};

const resetPasswordSchema = {
    query: Joi.object().keys({
        token: Joi.string().required(),
    }),
    body: Joi.object().keys({
        newPassword: Joi.string().min(8).required(),
    }),
};

const requestOTPSchema = Joi.object({
    email: Joi.string().email().required(),
});

const verifyOTPSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
});

const updatePasswordSchema = {
    body: Joi.object().keys({
        current_password: Joi.string().required(),
        new_password: Joi.string().min(8).required(),
        confirm_password: Joi.string()
            .valid(Joi.ref("new_password"))
            .required()
            .messages({ "any.only": "Confirm password must match new password" }),
    }),
};

export default {
    loginWithGoogleSchema,
    signUpSchema,
    logInWithPasswordSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    requestOTPSchema,
    verifyOTPSchema,
    updatePasswordSchema,
};
