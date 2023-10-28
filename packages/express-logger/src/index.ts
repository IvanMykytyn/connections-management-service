import * as winston from 'winston';
import * as Transport from 'winston-transport';
import * as expressWinston from 'express-winston';

const transports: Transport[] = [new winston.transports.Console()];
let format = winston.format.combine(
    winston.format.json(),
    winston.format.prettyPrint(),
    winston.format.colorize({ all: true }),
);

if (process.env.NODE_ENV === 'production') {
    // Change the transports here!
    format = winston.format.json();
}

export const loggerOptions: winston.LoggerOptions = {
    transports,
    format,
};

const logger = winston.createLogger(loggerOptions);

export default logger;

const expressLoggerOptions: expressWinston.LoggerOptions = {
    ...loggerOptions,
    metaField: null, //this causes the metadata to be stored at the root of the log entry
    responseField: null, // this prevents the response from being included in the metadata (including body and status code)
    meta: false,
    dynamicMeta: (req, res, err) => {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const httpRequest = {} as any;
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const meta = {} as any;

        if (req) {
            meta.httpRequest = httpRequest;
            httpRequest.requestMethod = req.method;
            httpRequest.requestUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
            httpRequest.protocol = `HTTP/${req.httpVersion}`;
            httpRequest.remoteIp = req.ip.indexOf(':') >= 0 ? req.ip.substring(req.ip.lastIndexOf(':') + 1) : req.ip; // just ipv4
            httpRequest.requestSize = req.socket.bytesRead;
            httpRequest.userAgent = req.get('User-Agent');
        }

        if (res) {
            meta.httpRequest = httpRequest;
            httpRequest.status = res.statusCode;
        }

        if (err) {
            meta.httpRequest = httpRequest;
            httpRequest.err = err;
        }
        return meta;
    },
} as expressWinston.LoggerOptions;

if (process.env.NODE_ENV === 'prod') {
    expressLoggerOptions.meta = true;
}

// here we are preparing the expressWinston logging middleware configuration,
// which will automatically log all HTTP requests handled by Express.js
export const expressWinstonLogger = expressWinston.logger(expressLoggerOptions);
