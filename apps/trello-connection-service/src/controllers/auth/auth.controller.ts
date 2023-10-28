import { Controller, Get, Post, Queries, Request, Route, SuccessResponse, Tags } from 'tsoa';
import { Request as RequestExpress, Response as ResponseExpress } from 'express';
import trelloAppService from '../../services/trello-app.service';
import { startAuthMessages, successfulAuthMessages } from '../../helpers/messages';

interface IHandleAuthCallbackQueryParams {
    oauth_token: string;
    oauth_verifier: string;
}

@Route('/trello/auth')
@Tags('Auth Controller')
export class AuthController extends Controller {
    @Get('/start')
    public startOAuthLanding(@Request() req: RequestExpress): void {
        const res = req.res as ResponseExpress;
        return res.render('start', {
            layout: 'layout',
            title: startAuthMessages.title,
            message: startAuthMessages.message,
        });
    }

    @Post('/start')
    @SuccessResponse(302, 'Redirect')
    public async startAuthFlow(@Request() req: RequestExpress): Promise<void> {
        const res = req.res as ResponseExpress;
        const redirectUrl = await trelloAppService.getAuthRedirectUrl();

        return res.redirect(redirectUrl);
    }

    @Get('/callback')
    public async handleAuthCallbackResponse(
        @Queries() params: IHandleAuthCallbackQueryParams,
        @Request() req: RequestExpress,
    ): Promise<void> {
        const res = req.res as ResponseExpress;
        const { oauth_token, oauth_verifier } = params || {};
        await trelloAppService.storeAccessToken(oauth_token, oauth_verifier);

        return res.redirect('/trello/auth/done');
    }

    @Get('/done')
    public async done(@Request() req: RequestExpress): Promise<void> {
        const res = req.res as ResponseExpress;

        return res.render('done', {
            layout: 'layout',
            title: successfulAuthMessages.title,
            message: successfulAuthMessages.message,
        });
    }
}
