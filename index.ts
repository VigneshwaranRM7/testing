import dotenv from "dotenv";
import ExpressConfig from "./src/app";
import envConfig from "./src/config/env";
import mongoose from "mongoose";
import logger from "./src/config/logger";
import { Server } from "node:http";
dotenv.config();

const app = ExpressConfig();
const port = envConfig.port;

let server: Server;
const { url, options } = envConfig.database;

mongoose.set("strictQuery", false);
mongoose.connect(url).then(() => {
    logger.info("Connected to MongoDB");
    const port = 8080;
    server = app.listen(port, '0.0.0.0', () => {
        logger.info(`Listening to http://localhost:${port}`);
        // swaggerDocs(app, port);
    });


});
