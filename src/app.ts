
import express, { type Application } from 'express'
import { authRouter } from './modules/auth/auth.route'
import logger from './middleware/logger';
import { issueRouter } from './modules/issue/issue.route';
import cors from 'cors';
import config from './config';
import globalErrorHandler from './middleware/globalErrorHandler';

const app: Application = express()

app.use(express.json())
app.use(logger);

const corsOptions = {
    origin: config.clientUrl,
    
};

app.use(cors(corsOptions));


app.use('/api/auth', authRouter);
app.use('/api/issues', issueRouter);

app.use(globalErrorHandler);
 


export default app;