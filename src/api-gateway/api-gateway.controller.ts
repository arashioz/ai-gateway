import { Controller, Get, Headers, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiHeaders } from '@nestjs/swagger';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';
import { ApiGatewayService } from './api-gateway.service';

@Controller('api-gateway')
@ApiBearerAuth()
export class ApiGatewayController {
    constructor(private readonly apiGateWayService: ApiGatewayService) { }
    @Get('/car-damage')
    @ApiHeader({
        name: 'gateway-api-key',
        description: 'Custom header to be passed with the request',
        required: true,
    })
    @UseGuards(ApiKeyGuard)
    ai_carService(@Headers('gateway-api-key') apiKey: string) {
        this.apiGateWayService.carDamageController(apiKey)
    }
}
