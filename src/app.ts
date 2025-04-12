import express, { Application } from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { errorConverter, errorHandler } from "./middlewares/error.mw";
import envConfig from "./config/env";
import morgan from "./config/morgan";
import cors from "cors";
import passport from "passport";
import jwtStrategy from "./config/passport";

const ExpressConfig = (): Application => {
    const app = express();

    //* Morgan config is used to log the requests
    if (envConfig.env !== "test") {
        app.use(morgan.successHandler);
        app.use(morgan.errorHandler);
    }

    //* Handle cors
    app.use(
        cors({
            origin: [
                "http://localhost:3030",
                "https://rfc-ui.netlify.app",
                "http://localhost:3000",
                "https://master--rfc-ui.netlify.app",
                "https://staging--rfc-ui.netlify.app",
                "https://rfc.getrecord.in",
            ],
            methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
            credentials: true,
        })
    );
    app.options("*", cors());

    //* Handle jwt auth
    app.use(passport.initialize());
    passport.use("jwt", jwtStrategy);

    app.use(compression());
    app.use(cookieParser());

    // Configure express for larger file uploads
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ extended: true, limit: "50mb" }));

    app.use("/api/v1", routes);
    app.use(errorHandler);
    app.use(errorConverter);
    return app;
};

export default ExpressConfig;
