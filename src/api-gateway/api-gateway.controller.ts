import { Controller, Get, Headers, HttpException, HttpStatus, Inject, Logger, Post, Query, Res, UploadedFiles, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiHeader, ApiHeaders, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';
import { ClientProxy } from '@nestjs/microservices';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import mongoose, { Types } from 'mongoose';
import { lastValueFrom } from 'rxjs';
import { CarDamageConfigConstants } from 'src/common/constants/car-damage.const';
import { ImageValidationPipe } from 'src/common/pipes/file.pipes';
import { Response } from 'express';
import { readFileSync } from 'fs';

@Controller('services')
@ApiBearerAuth()
export class ApiGatewayController {
    constructor(
        @Inject('CAR_DAMAGE_CLIENT') private readonly client: ClientProxy,
        @Inject('DENTAL_CLIENT') private readonly client_2: ClientProxy

    ) { }
    private readonly logger = new Logger(ApiGatewayController.name);

    @ApiTags('Car Damage')
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
                configs: {
                    type: 'object',
                    format: 'json',
                    example: JSON.stringify(CarDamageConfigConstants),
                    description: 'if use default configs change this input and use "" '
                },
                images: {
                    type: 'array',
                    items: {
                        format: 'binary'
                    }
                },
            },
        },
    })
    @UseGuards(ApiKeyGuard)
    @UseInterceptors(FilesInterceptor('images', 10, {
        storage: diskStorage({
            destination: './damage-uploads',
            filename: (req, file, callback) => {
                const uniqueName = `${new mongoose.Types.ObjectId()}${extname(file.originalname)}`; // تولید نام منحصر به فرد
                callback(null, uniqueName);
            },
        }),
    })) ai_carService(
        @Headers('gateway-api-key') apiKey: string,
        @UploadedFiles() files: Array<Express.Multer.File>
    ) {
        const payload = { files: files.map(file => file.filename), apiKey };
        const response = this.client.send({ cmd: 'process_car_damage' }, payload)
        return lastValueFrom(response)
    }



    @ApiTags('Dental')
    @ApiQuery({ name: 'illness', required: false, type: Boolean, description: 'if empty all queries this query is true ' })
    @ApiQuery({ name: 'cure', required: false, type: Boolean })
    @ApiQuery({ name: 'teeth', required: false, type: Boolean })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                images: {
                    type: 'string',
                    format: 'binary'
                },
            },
        },
    })
    @UsePipes(ImageValidationPipe)
    @Post('/dental/detector')
    @UseInterceptors(FilesInterceptor('images', 1, {
        storage: diskStorage({
            destination: './dental-uploads',
            filename: (req, file, callback) => {
                const uniqueName = `${new mongoose.Types.ObjectId()}${extname(file.originalname)}`;
                callback(null, uniqueName);
            },
        }),
    }))
    @ApiConsumes('multipart/form-data')
    @UseGuards(ApiKeyGuard)
    async ai_dentalService(
        @Headers('gateway-api-key') apiKey: string,
        @UploadedFiles() file: Express.Multer.File,
        @Query() query: string,
        @Res() res: Response
    ) {
        const payload = { file: file, apiKey, query };
        if (Object.keys(query).length === 3 || Object.keys(query).length  === 2) throw new HttpException('can use one attribute please check your queries', HttpStatus.CONFLICT)
        else {
            return this.client.send({ cmd: 'process_dental' }, payload).subscribe(imgAddress => {
                res.contentType('image/jpg');
                res.attachment()
                res.send(readFileSync(join(imgAddress)))
            })
        }


    }
}

