import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { globalErrorHandler } from "./middleware/error.middleware.js";

import { UsersRouter, AuthRouter } from "./routes/index.js";

const app = express();
const PORT = +(process.env['PORT'] || 5000);

app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173', // React front-end
    credentials: true, // Enables cookie/session usage across a different origin
}));
app.use(express.json());

app.use('/api/v1', AuthRouter);
app.use('/api/v1', UsersRouter);

app.use(globalErrorHandler);

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});