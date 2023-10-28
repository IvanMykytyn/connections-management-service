import { Controller, Get, Route, SuccessResponse, Tags } from 'tsoa';

@Tags('Health Check')
@Route('health')
export class HealthController extends Controller {
    /**
     * Service endpoint to check if the app is responding.
     */
    @Get()
    @SuccessResponse('200', 'Health check')
    public async get() {
        return 'Health check ok!';
    }
}
