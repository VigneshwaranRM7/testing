import Joi from "joi";
import config from "dotenv";
import path from "path";

if (config) config.config({ path: path.join(__dirname, "../../.env") });

const envValidationSchema = Joi.object()
    .keys({
        NODE_ENV: Joi.string().valid("production", "development", "test").required(),
        PORT: Joi.number().default(3000),
        MONGODB_URL: Joi.string().required().description("Mongo DB url"),
        JWT_SECRET: Joi.string().required().description("JWT secret key"),
        AWS_ACCESS_KEY: Joi.string().required().description("AWS access key"),
        AWS_SECRET_KEY: Joi.string().required().description("AWS secret key"),
        AWS_REGION: Joi.string().required().description("AWS region"),
        AWS_BUCKET_NAME: Joi.string().required().description("AWS bucket name"),
        UI_BASE_URL: Joi.string().required().description("UI base url"),
        RAZORPAY_KEY_ID: Joi.string().required().description("Razorpay key id"),
        RAZORPAY_KEY_SECRET: Joi.string().required().description("Razorpay key secret"),
    })
    .unknown();

const { value: ENV_VARS, error } = envValidationSchema.prefs({ errors: { label: "key" } }).validate(process.env);

if (error) {
    throw new Error(`Env Configuration validation error: ${error.message}`);
}

const envConfig = {
    env: ENV_VARS.NODE_ENV,
    port: ENV_VARS.PORT,
    database: {
        url: ENV_VARS.MONGODB_URL,
        options: {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
    },
    jwt: {
        secret: ENV_VARS.JWT_SECRET,
    },
    aws: {
        accessKey: ENV_VARS.AWS_ACCESS_KEY,
        secretKey: ENV_VARS.AWS_SECRET_KEY,
        region: ENV_VARS.AWS_REGION,
        bucketName: ENV_VARS.AWS_BUCKET_NAME,
    },
    ui: {
        base_url: ENV_VARS.UI_BASE_URL,
    },
    razorpay: {
        key_id: ENV_VARS.RAZORPAY_KEY_ID,
        key_secret: ENV_VARS.RAZORPAY_KEY_SECRET,
    },
};

export default envConfig;
