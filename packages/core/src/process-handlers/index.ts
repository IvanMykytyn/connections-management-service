import { Server } from 'http';
import logger from 'express-logger';

/**
 * Register handlers for unhandled rejections (Promise rejections)
 */
export const handleRejections = () => {
    process.on('unhandledRejection', (reason, p) => {
        const errMessage = `unhandledRejection - at: ${p}, reason: ${reason}`;
        const tags = reason instanceof Error ? { stack: reason.stack } : { reason };

        logger.error(errMessage, tags);
    });
};

/**
 * Register handlers for uncaught exceptions (synchronous errors)
 */
export const handleExceptions = () => {
    process.on('uncaughtException', (reason, p) => {
        const errMessage = `uncaughtException - at: ${p}, reason: ${reason}`;
        const tags = reason instanceof Error ? { stack: reason.stack } : { reason };

        logger.error(errMessage, tags);
    });
};

/**
 * Register handlers for SIGINT (Ctrl+C) - will close the server gracefully
 * @param server
 */
export const handleShutdown = (server: Server) => {
    process.on('SIGINT', () => {
        logger.warn('Received SIGINT, shutting down the server');

        server.close(() => {
            logger.info('Server was shutdown gracefully');
            process.exit(0);
        });
    });
};
