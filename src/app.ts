import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import path from "path";
import config from "./app/config";
import router from "./app/routes";
import notFound from "./app/middlewares/notFound";
import globalErrorHandelar from "./app/middlewares/globalErrorHandler";
import cron from 'node-cron';
import auto_delete_unverifyed_user from "./app/utils/auto_delete_unverifyed_user";
import AppError from "./app/errors/AppError";
import status from "http-status";
declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
    }
  }
}

const app = express();

// ======= Middlewares =======
app.use(cookieParser());

app.use(
  bodyParser.json({
    verify: (req: express.Request, _res, buf: Buffer) => {
      req.rawBody = buf;
    },
  })
);

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  config.file_path as string,
  express.static(path.join(__dirname, 'public')),
);




// ======= CORS =======
app.use(cors({
     origin: '*',
     credentials: true
}));

// ======= Test Route =======
app.get("/", (_req, res) => {
  res.send({
    status: true,
    message: "Welcome to Hide and Squeaks Server. It is running!",
  });
});

// auto_delete_unverifyed_user
cron.schedule("*/30 * * * *", async () => {
  try {
    await auto_delete_unverifyed_user();
  } catch (error: any) {
    throw new AppError(
      status.BAD_REQUEST,
      "Issues in the notification cron job (every 30 minutes)",
      error
    );
  }
});

// ======= API Routes =======
app.use("/api/v1", router);

// ======= 404 & Global Error Handler =======
app.use(notFound);
app.use(globalErrorHandelar);

export default app;
