import { Request, Response } from 'express';

/**
 * Custom Error
 *
 * Add a handle method implementation to manage a 'self' handle of the exception:
 * @param req
 * @param res
 * @returns
 */
export abstract class SelfHandledException extends Error {
    protected constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, SelfHandledException.prototype);
    }

    public abstract handleException(req: Request, res: Response): Promise<unknown>;
}

export class InfisicalTokenIsNotProvidedError extends Error {
    constructor() {
        super('Please provide Infisical token');
        Object.setPrototypeOf(this, InfisicalTokenIsNotProvidedError.prototype);
    }
}
