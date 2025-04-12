import { HttpStatusCode } from "axios";
import Joi from "joi";
import { NextFunction } from "express";
import { Request, Response } from "express";
import ApiError from "../utils/api-error";
import pick from "../utils/pick.util";

const validate = (schema: any) => (req: Request, res: Response, next: NextFunction) => {
    const validSchema = pick(schema, ["params", "query", "body"]);
    const object = pick(req, Object.keys(validSchema));
    const { value, error } = Joi.compile(validSchema)
        .prefs({ errors: { label: "key" }, abortEarly: false })
        .validate(object);

    if (error) {
        const errorMessage = error.details.map((details) => details.message).join(", ");
        return next(new ApiError(HttpStatusCode.BadRequest, errorMessage));
    }
    Object.assign(req, value);
    return next();
};

export default validate;
