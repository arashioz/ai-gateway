import { Controller, Get, Headers, Inject, Logger, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiHeader, ApiHeaders, ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';
import { ClientProxy } from '@nestjs/microservices';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import mongoose, { Types } from 'mongoose';
import { lastValueFrom } from 'rxjs';

@Controller('api-gateway')
@ApiBearerAuth()
export class ApiGatewayController {
    constructor(
        @Inject('CAR_DAMAGE_CLIENT') private readonly client: ClientProxy

    ) { }
    private readonly logger = new Logger(ApiGatewayController.name);


    @Post('/car-damage/detector')
    @ApiHeader({
        name: 'gateway-api-key',
        description: 'Custom header to be passed with the request',
        required: true,
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                comment: { type: 'string' },
                outletId: { type: 'integer' },
                file: {
                    type: 'array',
                    format: 'binary',
                },
            },
        },
    })
    @UseGuards(ApiKeyGuard)
    @UseInterceptors(FilesInterceptor('images', 10, {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, callback) => {
                const uniqueName = `${new mongoose.Types.ObjectId()}${extname(file.originalname)}`; // تولید نام منحصر به فرد
                callback(null, uniqueName);
            },
        }),
    })) ai_carService(
        @Headers('gateway-api-key') apiKey: string,
        @UploadedFiles() files: Array<Express.Multer.File>
    ) {
        const payload = { files: files.map(file => file.filename),  apiKey };
        const response = this.client.send({ cmd: 'process_car_damage' }, payload)
        return lastValueFrom(response)
    }
}

