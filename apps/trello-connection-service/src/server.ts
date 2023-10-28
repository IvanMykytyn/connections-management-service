import * as dotenv from 'dotenv';
dotenv.config();
import { app } from './app';
import { envUtils, handleExceptions, handleRejections, handleShutdown } from 'core';

handleRejections();
handleExceptions();

const port = envUtils.getEnvVar('PORT', '3000');
const server = app.listen(parseInt(port), () => console.log(`App listening at http://localhost:${port}`));

handleShutdown(server);
