import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createReadStream, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path, { join } from 'node:path';
import { DentalDto } from 'src/common/dto/dental.dto';
import { DentalServiceModel } from 'src/database/schemas/dental-service.schema';
import * as FormData from 'form-data';
import { randomUUID } from 'node:crypto';
import * as sharp from 'sharp';
import { lastValueFrom } from 'rxjs';
import { rename } from 'node:fs/promises';
import { createCanvas, loadImage } from 'canvas';

@Injectable()
export class DentalServiceService {
    private serviceURI = this.configService.get<string>('DENTAL_SERVICE_URI')
    private serviceHeader = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept': 'application/json'
    }
    private readonly logger = new Logger(DentalServiceService.name);

    constructor(private readonly httpService: HttpService, private readonly configService: ConfigService, @InjectModel(DentalServiceModel.name) private readonly dentalModel: Model<DentalServiceModel>) { }

    private async postImageDetection(file: string, query: string) {
        const formData = new FormData()
        const newFolder = this.createFolder(randomUUID())

        let imgPath = this.searchFile(`${process.cwd()}/dental-uploads`, file)
        const destPath = join(newFolder, file);
        rename(imgPath, destPath)

        formData.append('image', createReadStream(destPath))
        return this.requestController(formData, query, destPath)
    }
    private async requestController(formData, query, destPath) {
        let selectURI = `detect_${Object.keys(query)[0]}`;
        try {
            let response = this.httpService.post(`${this.serviceURI}${selectURI}`, formData, {
                headers: {
                    ...this.serviceHeader, ...formData.getHeaders()
                }
            })
            return { report: (await lastValueFrom(response)).data, imagePath: destPath, }

        } catch (err) {
            this.logger.error(err)
            return err.message
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
    private createFolder(folderId: string): string {
        try {
            if (!existsSync(`${process.cwd()}/dental-uploads/${folderId}`)) {
                mkdirSync(`${process.cwd()}/dental-uploads/${folderId}`);
                return `${process.cwd()}/dental-uploads/${folderId}`
            }
            mkdirSync(folderId);
            return `${process.cwd()}/dental-uploads/${folderId}`

        } catch (err) {
            this.logger.error(err)
        }
    }

    private createSVGOverlay(data, width, height) {
        const boxes = [];

        for (const category in data.report) {
            data.report[category].forEach(item => {
                const [x1, y1, x2, y2] = item.bbox;
                const rect = `<rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" stroke="red" fill="none" stroke-width="3"/>`;
                const text = `<text x="${x1}" y="${y1 - 5}" font-size="20" fill="red">${item.name} (${(item.confidence * 100).toFixed(1)}%)</text>`;
                boxes.push(rect, text);
            });
        }

        return `<svg width="${width}" height="${height}">${boxes.join('')}</svg>`;
    };
    private async addOverlaysToImage(imagePath, outputPath, data) {
        const image = sharp(imagePath);
        const { width, height } = await image.metadata();
        const svgOverlay = this.createSVGOverlay(data, width, height);

        await image
            .composite([{ input: Buffer.from(svgOverlay), blend: 'over' }])
            .toFile(outputPath);

    };

    async drawBoundingBoxes(data, imagePath: string, outputFile: string) {
        await this.addOverlaysToImage(imagePath, outputFile, data);
        return outputFile
    }


    async processor(data: any) {
        let aiReport = await this.postImageDetection(data.file[0].filename, data.query)
        let imageSavePath = aiReport.imagePath.split('/');
        imageSavePath[imageSavePath.length - 1] = 'report.jpg';
        imageSavePath = imageSavePath.join('/');
        const imageAddress = await this.drawBoundingBoxes(aiReport.report, aiReport.imagePath, imageSavePath);
        return imageAddress
    }



}
