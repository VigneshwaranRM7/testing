import { ExtractJwt, Strategy, StrategyOptions, VerifiedCallback } from "passport-jwt";
import envConfig from "./env";
import recruiterModel from "../models/recruiter.model";

const passportOptions: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: envConfig.jwt.secret,
};

const jwtVerify: VerifiedCallback = async (payload, done: any) => {
    try {
        const user = await recruiterModel.findById({ _id: payload.sub });
        if (!user) {
            return done(null, false);
        }
        done(null, user);
    } catch (err) {
        done(err, false);
    }
};

const jwtStrategy = new Strategy(passportOptions, jwtVerify);

export default jwtStrategy;
