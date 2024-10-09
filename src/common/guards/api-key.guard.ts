import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomersModel } from 'src/database/schemas/customer.schema';
import { PlanList, PlanType } from '../types/plan.type';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(@InjectModel(CustomersModel.name) private customerModel: Model<CustomersModel>) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['gateway-api-key'] as string;

        if (!apiKey) {
            throw new HttpException('API Key is missing', HttpStatus.FORBIDDEN);
        }

        let requestObject: any;
        const customer = await this.customerModel.findOne({ 'apiKey.key': apiKey });
        let routeRequest = String(request.route.path).trim().split('/')[2]

        if (routeRequest === "car-damage") {
            requestObject = customer.planDetails.find((p) => p.planName === "CarDamage")
        }
        if (routeRequest === "dental") {
            requestObject = customer.planDetails.find((p) => p.planName === "Dental")
        }
        if (!customer.accessServices.includes(requestObject.planName)) {
            throw new HttpException('Product Not Active For This API Key', HttpStatus.FORBIDDEN);

        }
        if (!customer) {
            throw new HttpException('Invalid API Key', HttpStatus.FORBIDDEN);
        }

        if (requestObject.requestCount >= requestObject.requestCountPlan) {
            throw new HttpException('Request limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
        }
        requestObject.requestCount++
        await this.customerModel.findOneAndUpdate(
            { "planDetails.planName": requestObject.planName },
            {
                $set: {
                    "planDetails.$.requestCount": requestObject.requestCount
                }
            },
            { new: true }
        );


        return true;
    }
}
