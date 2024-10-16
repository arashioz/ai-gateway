import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import axios from 'axios';
import { log } from 'console';
import * as qs from 'qs';
import { lastValueFrom } from 'rxjs';

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

    constructor(private readonly httpService: HttpService, private readonly configService: ConfigService) { }

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
            this.httpService.get(`${this.serviceURI}get_detection_config`, { headers: this.serviceHeader }).subscribe({
                next: (response) => {
                    this.serviceConfig = response.data;
                },
                error: (error) => {
                    console.error('Error:', error);
                },
            });
        } catch (err) {
            this.logger.error(err)
        }
    }
    private async postImageDetection(imageData , configData , apiKey) {
        try {

            // this.httpService.post(url)
        } catch (err) { 
            this.logger.error(err)

        }
    }



    async processor(imageData: Array<string>) {
        if (this.accessToken === null) await this.login()
        if (this.serviceConfig == null) await this.getDetectionConfig()

    }
}
