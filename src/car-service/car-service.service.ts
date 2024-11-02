import { HttpService } from '@nestjs/axios';
import { Headers, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { data } from 'cheerio/dist/commonjs/api/attributes';
import { log } from 'console';
import { Model, Types } from 'mongoose';
import * as qs from 'qs';
import { lastValueFrom } from 'rxjs';
import { CarServiceModel } from 'src/database/schemas/car-service.schema';
import { createReadStream, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path, { join } from 'node:path';
import * as FormData from 'form-data';
import { rename, copyFile, unlink } from 'node:fs/promises';
import { createCanvas } from 'canvas';
import sharp from 'sharp';




@Injectable()
export class CarServiceService {
    private accessToken: string = null
    private serviceConfig: object = null
    private serviceURI = this.configService.get<string>('CAR_DAMAGE_SERVICE_URI')
    private serviceHeader = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept': 'application/json'
    }
    private readonly logger = new Logger(CarServiceService.name);

    constructor(private readonly httpService: HttpService, private readonly configService: ConfigService, @InjectModel(CarServiceModel.name) private readonly carModel: Model<CarServiceModel>) { }

    private authenticateHeader() {
        this.serviceHeader['Authorization'] = `Bearer ${this.accessToken}`
    }

    private async login() {
        try {
            const loginData = {
                grant_type: 'password',
                username: this.configService.get<string>('CAR_DAMAGE_SERVICE_USER'),
                password: this.configService.get<string>('CAR_DAMAGE_SERVICE_PASS'),
                scope: '',
                client_id: 'string',
                client_secret: 'string',
            };
            const loginRS = this.httpService.post(`${this.serviceURI}token`, qs.stringify(loginData), {
                headers: this.serviceHeader
            })
            this.accessToken = (await lastValueFrom(loginRS)).data.access_token
            this.authenticateHeader()
        } catch (err) {
            this.logger.error(err)
        }
    }


    private async getDetectionConfig() {
        try {
            let defaultConfig = this.httpService.get(`${this.serviceURI}get_detection_config`, { headers: this.serviceHeader })
            this.serviceConfig = (await lastValueFrom(defaultConfig)).data
        } catch (err) {
            this.logger.error(err)
            return err.message
        }
    }

    private async postImageDetection(imageData: Array<string>, configData, apiKey) {
        const newFolder = this.createFolder(randomUUID())
        const formData = new FormData()
        const folderAndImageDetail = []
        imageData.forEach((i) => {
            let imgPath = this.searchFile(`${process.cwd()}/damage-uploads`, i)
            const destPath = join(newFolder, i);
            folderAndImageDetail.push(destPath)
            rename(imgPath, destPath)
            formData.append('files', createReadStream(destPath))
        })
        formData.append('data', JSON.stringify(this.serviceConfig));

        try {
            let response = this.httpService.post(`${this.serviceURI}detect_parts_with_damages`, formData, {
                headers: {
                    ...this.serviceHeader, ...formData.getHeaders()
                }
            })
            let processedImageBuffer = await this.processImageWithPolygons(folderAndImageDetail[0], (await lastValueFrom(response)).data.reports, folderAndImageDetail[0])
            writeFileSync('output_image.jpg', processedImageBuffer);


            return (await lastValueFrom(response)).data
        } catch (err) {
            this.logger.error(err)
            return err.message
        }
    }


    private createFolder(folderId: string): string {
        try {
            if (!existsSync(`${process.cwd()}/damage-uploads/${folderId}`)) {
                mkdirSync(`${process.cwd()}/damage-uploads/${folderId}`);
                return `${process.cwd()}/damage-uploads/${folderId}`
            }
            mkdirSync(folderId);
            return `${process.cwd()}/damage-uploads/${folderId}`

        } catch (err) {
            this.logger.error(err)
        }
    }
    private searchFile(dir: string, fileName: string) {
        const files = readdirSync(dir);

        for (const file of files) {
            const filePath = join(dir, file);
            const fileStat = statSync(filePath);
            if (fileStat.isDirectory()) {
                this.searchFile(filePath, fileName);
            } else if (file.endsWith(fileName)) {
                return filePath
            }
        }
    }

    private async processImageWithPolygons(
        imagePath: string,
        reports: any[],
        originalImagePath: string,
    ): Promise<Buffer> {
        try {
            const imageMetadata = await sharp(imagePath).metadata();
            const { width: imageWidth, height: imageHeight } = imageMetadata;

            const imageBuffer = await sharp(imagePath).toBuffer();

            const svgPolygons = reports
                .map((report) => {
                    return [report.part_segments]
                        .map((polygon) => {
                            const points = polygon.x
                                .map((x, index) => `${x},${polygon.y[index]}`)
                                .join(' ');
                            return `<polygon points="${points}" fill="rgba(255, 0, 0, 0.5)" stroke="rgba(255, 0, 0, 0.8)" stroke-width="1" />`;
                        })
                        .join('');
                })
                .join('');

            const svgOverlay = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${imageWidth} ${imageHeight}">
              ${svgPolygons}
            </svg>`;

            const processedImageBuffer = await sharp(imageBuffer)
                .composite([{ input: Buffer.from(svgOverlay), blend: 'over' }])
                .jpeg()
                .toBuffer();

            return processedImageBuffer;
        } catch (error) {
            console.error('Error processing image with polygons:', error.message);
            throw error;
        }
    }
    async processor(bodyData: { files: Array<string>, apiKey: string, configs?: {} }) {
        if (this.accessToken === null) await this.login()
        if (this.serviceConfig == null || bodyData.configs === undefined) await this.getDetectionConfig()
        return this.postImageDetection(bodyData.files, bodyData.configs == undefined && this.serviceConfig, bodyData.apiKey)
    }
}
