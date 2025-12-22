import express, { type Request, type Response } from "express";
import cors from "cors";

const app = express();
const PORT = +(process.env["PORT"] || 5000);

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Coldbook API is running...");
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});