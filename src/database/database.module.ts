import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomersModel, CustomersSchema } from './schemas/customer.schema';
import { CustomersService } from 'src/customers/customers.service';
import { PlansService } from 'src/plans/plans.service';
import { PlanModels, PlanSchema } from './schemas/plan.schema';
import { HttpModule } from '@nestjs/axios';
import { CarServiceModel, CarServiceSchema } from './schemas/car-service.schema';
import { CarServiceService } from 'src/car-service/car-service.service';
import { DentalServiceModel, DentalServiceSchema } from './schemas/dental-service.schema';
import { DentalServiceService } from 'src/dental-service/dental-service.service';

@Module({
    imports: [MongooseModule.forRootAsync({
        inject: [ConfigService], useFactory: (configService: ConfigService) => ({
            uri: configService.get<string>('DATABASE_URL'),
        }),
    }),
        HttpModule,
    MongooseModule.forFeature([
        { name: CustomersModel.name, schema: CustomersSchema },
        { name: PlanModels.name, schema: PlanSchema },
        { name: CarServiceModel.name, schema: CarServiceSchema },
        { name: DentalServiceModel.name, schema: DentalServiceSchema }

    ])],
    providers: [CustomersService, PlansService, CarServiceService, DentalServiceService],
    exports: [MongooseModule, CustomersService, PlansService, CarServiceService, DentalServiceService]
})
export class DatabaseModule { }
