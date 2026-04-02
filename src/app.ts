import express from "express";
import { Request } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import routes from "./routes";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/errorHandler";
import { notFoundHandler } from "./middlewares/notFound";
import { requestContext } from "./middlewares/requestContext";

const app = express();

morgan.token("reqid", (req: Request) => req.requestId ?? "-");

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestContext);
app.use(morgan(":method :url :status :response-time ms reqId=:reqid"));

app.use(
  rateLimit({
    windowMs: env.rateLimitWindowMs,
    limit: env.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use("/api/v1", routes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
