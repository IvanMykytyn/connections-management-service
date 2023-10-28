import { NextFunction, Request, Response } from 'express';
import { ValidateError } from 'tsoa';
import logger from 'express-logger';
import { SelfHandledException } from '../exceptions/self-handled-exception';

/**
 * Error middleware
 *
 * Will handle all the errors thrown in the routes. In case:
 * * Validation error - return the needed data
 * * SelfHandled error - pass the handling to the exception method
 * * API error - return the API error
 * @param err
 * @param req
 * @param res
 * @param _next
 * @returns
 */
const errorMiddleware = async (err: Error, req: Request, res: Response, _next: NextFunction) => {
    logger.error(`Failed on route: ${req.method} ${req.path}`, { err });

    if (err instanceof SelfHandledException) {
        return await err.handleException(req, res);
    }

    if (err instanceof ValidateError) {
        logger.warn(`Caught Validation Error for ${req.path}:`, err.fields);
        return res.status(422).json({
            message: 'Validation Failed',
            details: err?.fields,
        });
    }

    if (res.headersSent) {
        logger.warn('An error was thrown but response was send already', { txnId: res.locals.txnId });
        return;
    }

    if (process.env['NODE_ENV'] === 'production') {
        return res.status(500).end();
    }

    return res.status(500).json({
        error: {
            name: err.name,
            message: err.message,
            stack: err.stack,
        },
    });
};

export default errorMiddleware;
