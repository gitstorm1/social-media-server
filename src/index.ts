import express, { type Request, type Response } from 'express';
import cors from 'cors';

import { globalErrorHandler } from './middleware/error.middleware.js';

import { UsersRouter, AuthRouter } from './routes/index.js';

const app = express();
const PORT = +(process.env['PORT'] || 5000);

app.use(cors());
app.use(express.json());

app.use('/api/v1', AuthRouter);
app.use('/api/v1', UsersRouter);

app.use(globalErrorHandler);

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});