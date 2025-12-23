import express, { type Request, type Response } from "express";
import cors from "cors";
import { UsersRouter } from "./routes/index.js";

const app = express();
const PORT = +(process.env["PORT"] || 5000);

app.use(cors());
app.use(express.json());

app.use("/api/v1", UsersRouter);

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});