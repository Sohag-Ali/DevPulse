
import express, { type Application } from 'express'


import { authRouter } from './modules/auth/auth.route'

import logger from './middleware/logger';
import { issueRouter } from './modules/issue/issue.route';

const app: Application = express()

app.use(express.json())

app.use(logger);


app.use('/api/auth', authRouter);

app.use('/api/issues', issueRouter);

export default app;