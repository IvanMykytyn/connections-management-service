import { Body, Controller, Get, Post, Query, Request, Route, SuccessResponse, Tags } from 'tsoa';
import { Request as RequestExpress, Response as ResponseExpress } from 'express';
import tickTickAppService from '../../services/tick-tick-app.service';

import { emailNotSpecifiedMessages, startAuthMessages, successfulAuthMessages } from '../../helpers/messages';

interface StartAuthFlowBody {
    email: string;
}

@Route('/tick-tick/auth')
@Tags('Tick Tick Auth Controller')
export class AuthController extends Controller {
    @Get('/start')
    public startOAuthLanding(@Request() req: RequestExpress, @Query('email') email?: string): void {
        const res = req.res as ResponseExpress;
        if (!email) {
            return res.render('done', {
                layout: 'layout',
                title: emailNotSpecifiedMessages.title,
                message: emailNotSpecifiedMessages.message,
                email,
            });
        }
        return res.render('start', {
            layout: 'layout',
            title: startAuthMessages.title,
            message: startAuthMessages.message,
            email,
        });
    }

    @Post('/start')
    @SuccessResponse(302, 'Redirect')
    public async startAuthFlow(@Request() req: RequestExpress, @Body() body: StartAuthFlowBody): Promise<void> {
        const res = req.res as ResponseExpress;
        const redirectUrl = await tickTickAppService.getAuthRedirectUrl({ email: body.email });

        return res.redirect(redirectUrl);
    }

    @Get('/callback')
    public async handleAuthCallbackResponse(
        @Query('code') code: string,
        @Query('state') state: string,
        @Request() req: RequestExpress,
    ): Promise<void> {
        const res = req.res as ResponseExpress;
        const email = JSON.parse(state).email;
        const accessToken = await tickTickAppService.getAccessToken(code);
        await tickTickAppService.storeAccessToken(email, accessToken);

        return res.redirect('/tick-tick/auth/done');
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
