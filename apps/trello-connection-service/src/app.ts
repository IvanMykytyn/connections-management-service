import path from 'path';
import swaggerUi from 'swagger-ui-express';
import partials from 'express-partials';
import helmet from 'helmet';
import cors from 'cors';
import express, { json, urlencoded, Response as ExResponse, Request as ExRequest } from 'express';
import { expressWinstonLogger } from 'express-logger';
import { envUtils, errorMiddleware } from 'core';

import { RegisterRoutes } from '../build/routes';

const env = envUtils.getEnvVar('NODE_ENV');

const isProduction = env === 'production';

export const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(partials());

const devHelmetDirectivesOverride: Record<string, null> = !isProduction ? { 'upgrade-insecure-requests': null } : {};

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                // Allow to send forms
                'form-action': ['*'],
                ...devHelmetDirectivesOverride,
            },
        },
    }),
);

// Use body parser to read sent json payloads
app.use(
    urlencoded({
        extended: true,
    }),
);
app.use(json());

app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        maxAge: 3600,
        optionsSuccessStatus: 204,
    }),
);

// Adding express logger
app.use(expressWinstonLogger);

RegisterRoutes(app);

app.use(errorMiddleware);

if (!isProduction) {
    app.use('/docs', swaggerUi.serve, async (_req: ExRequest, res: ExResponse) =>
        res.send(swaggerUi.generateHTML(await import('../build/swagger.json'))),
    );
}

app.use('/static', express.static(path.join(__dirname, 'public')));

app.use((_req, res) => {
    res.status(404).redirect('/trello/auth/start');
});
